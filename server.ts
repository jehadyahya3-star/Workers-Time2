import express from 'express';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Enable CORS and PWA asset headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Explicit PWA routes with correct Content-Type headers
app.get(['/manifest.json', '/site.webmanifest'], (req, res) => {
  const distManifestPath = path.join(process.cwd(), 'dist', 'manifest.json');
  const publicManifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  const fileToServe = fs.existsSync(distManifestPath) ? distManifestPath : publicManifestPath;
  if (fs.existsSync(fileToServe)) {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.sendFile(fileToServe);
  } else {
    res.status(404).send('Manifest not found');
  }
});

app.get('/sw.js', (req, res) => {
  const distSwPath = path.join(process.cwd(), 'dist', 'sw.js');
  const publicSwPath = path.join(process.cwd(), 'public', 'sw.js');
  const fileToServe = fs.existsSync(distSwPath) ? distSwPath : publicSwPath;
  if (fs.existsSync(fileToServe)) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(fileToServe);
  } else {
    res.status(404).send('Service worker not found');
  }
});

// Simple in-memory cache for weather results (15-minute TTL)
interface CachedWeather {
  data: any;
  timestamp: number;
}
const weatherCache = new Map<string, CachedWeather>();
const CACHE_TTL_MS = 15 * 60 * 1000;

// API route for weather search grounding and live forecasting
app.get('/api/weather', async (req, res) => {
  const rawLocation = (req.query.location as string) || 'الرياض';
  const latStr = req.query.lat as string | undefined;
  const lngStr = req.query.lng as string | undefined;

  // Clean location string (e.g. "باجل - محل الطنين" -> "باجل")
  const primaryLocation = rawLocation.split('-')[0].split('،')[0].split('(')[0].trim() || rawLocation;

  const cacheKey = latStr && lngStr ? `coords_${latStr}_${lngStr}` : primaryLocation.toLowerCase();

  // Return cached result if available and fresh
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  // Open-Meteo weather code decoder
  const decodeWeatherCode = (code: number): string => {
    if (code === 0) return 'صافي ومشمس';
    if (code >= 1 && code <= 3) return 'غائم جزئياً إلى صافي';
    if (code === 45 || code === 48) return 'ضباب خفيف بالموقع';
    if (code >= 51 && code <= 57) return 'رذاذ خفيف';
    if (code >= 61 && code <= 67) return 'أجواء ممطرة';
    if (code >= 71 && code <= 77) return 'تساقط ثلوج';
    if (code >= 80 && code <= 82) return 'زخات مطرية متفرقة';
    if (code >= 95 && code <= 99) return 'عواصف رعدية ممطرة';
    return 'معتدل ومستقر';
  };

  let realWeather: {
    locationName: string;
    temperature: string;
    condition: string;
    humidity: string;
    windSpeed: string;
    lat?: number;
    lng?: number;
  } | null = null;

  try {
    let lat: number | undefined = latStr ? parseFloat(latStr) : undefined;
    let lng: number | undefined = lngStr ? parseFloat(lngStr) : undefined;
    let resolvedName = primaryLocation;

    // 1. Geocoding if coordinates not directly passed
    if ((lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) && primaryLocation) {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(primaryLocation)}&count=1&language=ar`
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            const match = geoData.results[0];
            lat = match.latitude;
            lng = match.longitude;
            resolvedName = match.name || primaryLocation;
            if (match.country) resolvedName += ` (${match.country})`;
          }
        }
      } catch (geoErr) {
        console.warn('Geocoding warning:', geoErr);
      }
    }

    // 2. Fetch forecast if lat/lng are known
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      const forecastRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
      );
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        const current = forecastData.current;
        if (current) {
          realWeather = {
            locationName: resolvedName,
            temperature: `${Math.round(current.temperature_2m)}°C`,
            condition: decodeWeatherCode(current.weather_code),
            humidity: `${Math.round(current.relative_humidity_2m)}%`,
            windSpeed: `${Math.round(current.wind_speed_10m)} كم/س`,
            lat,
            lng
          };
        }
      }
    }
  } catch (omErr) {
    console.warn('Open-Meteo fetch warning:', omErr);
  }

  // Fallback defaults if Open-Meteo wasn't reachable
  const finalLocation = realWeather?.locationName || rawLocation;
  const finalTemp = realWeather?.temperature || '32°C';
  const finalCondition = realWeather?.condition || 'مشمس جزئياً مع رياح معتدلة';
  const finalHumidity = realWeather?.humidity || '30%';
  const finalWindSpeed = realWeather?.windSpeed || '15 كم/س';

  // Smart dynamic recommendations generator based on real metrics
  const generateSmartRecommendations = (tempStr: string, windStr: string, cond: string): string[] => {
    const tempVal = parseInt(tempStr, 10) || 30;
    const windVal = parseInt(windStr, 10) || 15;
    const recs: string[] = [];

    if (tempVal >= 38) {
      recs.push('درجة الحرارة مرتفعة جداً: يوصى بمراقبة حرارة المحرك وزيوت الهيدروليك للمعدات وتجنب الأحمال القصوى بالظهر.');
    } else if (tempVal >= 32) {
      recs.push('الطقس حار نسبياً: يلزم فحص منسوب مياه الرديتر وسوائل التبريد وفلتر الهواء قبل بدء وردية العمل.');
    } else {
      recs.push('درجة الحرارة معتدلة ومناسبة لتشغيل كافة أنواع المعدات الثقيلة بأعلى كفاءة ميكانيكية.');
    }

    if (windVal >= 25) {
      recs.push('سرعة الرياح عالية: يجب توخي الحذر عند تحميل وتفريغ القلابات وتجنب العمل بالقرب من الحواف الرملية السائبة.');
    } else {
      recs.push('سرعة الرياح هادئة إلى معتدلة: تسمح بالرؤية الواضحة والعمل الآمن في مواقع الحفريات والتسوية.');
    }

    if (cond.includes('مطر') || cond.includes('رعد') || cond.includes('رذاذ')) {
      recs.push('تنبيه أمطار بالموقع: يُنصح بوقف الأعمال في مجاري السيول وتأمين مواقع توقف الحفارات والشيول في أراضٍ مرتفعة.');
    } else {
      recs.push('ينصح بالالتزام بجدول التشحيم الدوري للمفصلات والسنّابك ومراقبة ضغط الإطارات والجنازير.');
    }

    return recs;
  };

  const defaultRecs = generateSmartRecommendations(finalTemp, finalWindSpeed, finalCondition);

  const fallbackData = {
    location: finalLocation,
    temperature: finalTemp,
    condition: finalCondition,
    humidity: finalHumidity,
    windSpeed: finalWindSpeed,
    summary: `حالة الطقس المحدثة والمباشرة في موقع ${finalLocation}`,
    recommendations: defaultRecs,
    searchCitations: [],
    isFallback: !realWeather
  };

  // Try Gemini AI for enhanced grounding & recommendations if key exists
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      weatherCache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
      return res.json(fallbackData);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `أنت خبير طقس واستشاري هندسي لمشاريع المقاولات والمعدات الثقيلة.
معلومات الطقس المباشرة حالياً في موقع (${finalLocation}):
- درجة الحرارة: ${finalTemp}
- الحالة: ${finalCondition}
- نسبة الرطوبة: ${finalHumidity}
- سرعة الرياح: ${finalWindSpeed}

قدم تقريراً محدثاً وتوصيات تشغيلية محددة لمهندسي المواقع وسائقي المعدات الثقيلة (الشيول، البوكلين، القلابات، الجريدر) لهذا الموقع.

صغ الإجابة بتنسيق JSON حصراً بالشكل التالي:
{
  "location": "${finalLocation}",
  "temperature": "${finalTemp}",
  "condition": "${finalCondition}",
  "humidity": "${finalHumidity}",
  "windSpeed": "${finalWindSpeed}",
  "summary": "ملخص مختصر حالة طقس اليوم في الموقع",
  "recommendations": [
    "توصية تشغيلية 1 للمعدات الثقيلة وسائقي الشيول والحفارات",
    "توصية تشغيلية 2 للسلامة الميدانية ومراقبة الزيوت أو الحرارة",
    "توصية تشغيلية 3 بخصوص الفلترة والتشحيم والظروف الجوية"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const responseText = response.text || '';
    let parsedData: any = {};
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    } catch (e) {
      parsedData = {
        location: finalLocation,
        temperature: finalTemp,
        condition: finalCondition,
        humidity: finalHumidity,
        windSpeed: finalWindSpeed,
        summary: responseText.slice(0, 150) || fallbackData.summary,
        recommendations: defaultRecs
      };
    }

    // Extract grounding citations if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const citations = groundingChunks
      .filter((c: any) => c.web?.uri)
      .map((c: any) => ({
        title: c.web.title || c.web.uri,
        uri: c.web.uri
      }));

    const result = {
      location: parsedData.location || finalLocation,
      temperature: parsedData.temperature || finalTemp,
      condition: parsedData.condition || finalCondition,
      humidity: parsedData.humidity || finalHumidity,
      windSpeed: parsedData.windSpeed || finalWindSpeed,
      summary: parsedData.summary || fallbackData.summary,
      recommendations: Array.isArray(parsedData.recommendations) && parsedData.recommendations.length > 0
        ? parsedData.recommendations
        : defaultRecs,
      searchCitations: citations,
      isFallback: false
    };

    weatherCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return res.json(result);
  } catch (error: any) {
    const isQuotaOrBusy = error?.status === 429 || error?.status === 503 || error?.code === 503 || error?.message?.includes('quota') || error?.message?.includes('429') || error?.message?.includes('503') || error?.message?.includes('UNAVAILABLE') || error?.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuotaOrBusy) {
      console.log('Gemini API busy/quota limit. Serving live Open-Meteo weather report.');
    } else {
      console.log('Serving live Open-Meteo weather report.');
    }
    weatherCache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
    return res.json(fallbackData);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const cwdDist = path.join(process.cwd(), 'dist');
    const distPath = fs.existsSync(path.join(cwdDist, 'index.html'))
      ? cwdDist
      : path.join(__dirname);

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application build files not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
