import React, { useState, useEffect, useRef } from 'react';
import { 
  ContractType, 
  WorkPeriod, 
  WorkReport, 
  Equipment, 
  Company, 
  Driver, 
  OperationalCosts,
  ProjectItem
} from '../types';
import { formatHoursDigital } from '../utils/exportUtils';
import { 
  FileCheck, 
  Plus, 
  Trash2, 
  Clock, 
  Calculator, 
  Fuel, 
  DollarSign, 
  CheckCircle2, 
  PenTool, 
  RotateCcw,
  Gauge,
  AlertCircle,
  Paperclip,
  Camera,
  FileText,
  User,
  UserCheck,
  X
} from 'lucide-react';

interface CostAttachmentInputProps {
  labelName: string;
  notesValue?: string;
  onNotesChange: (val: string) => void;
  attachmentValue?: string;
  onAttachmentChange: (base64: string | undefined) => void;
}

const CostAttachmentInput: React.FC<CostAttachmentInputProps> = ({
  labelName,
  notesValue = '',
  onNotesChange,
  attachmentValue,
  onAttachmentChange
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(Boolean(notesValue || attachmentValue));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير، يرجى اختيار صورة أقل من 5 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onAttachmentChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mt-2 border-t border-slate-200/60 pt-2">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-[11px] font-bold text-slate-600 hover:text-amber-600 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Paperclip className="w-3.5 h-3.5" />
          <span>إضافة ملاحظة أو صورة سند استلام ({labelName})</span>
        </button>
      ) : (
        <div className="space-y-2 bg-white/90 p-2.5 rounded-lg border border-slate-200 text-right">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>ملاحظة وسند ({labelName}):</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              إخفاء
            </button>
          </div>

          <input
            type="text"
            value={notesValue}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={`ملاحظة حول ${labelName} أو رقم سند الاستلام...`}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />

          <div className="flex items-center gap-2 pt-1">
            {attachmentValue ? (
              <div className="relative group inline-block">
                <img
                  src={attachmentValue}
                  alt={`سند ${labelName}`}
                  className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => onAttachmentChange(undefined)}
                  className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                  title="حذف المرفق"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-600" />
                  <span>إرفاق صورة السند / الفاتورة</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface WorkReportFormProps {
  equipmentList: Equipment[];
  companiesList: Company[];
  driversList: Driver[];
  projectItems?: ProjectItem[];
  defaultDieselPrice?: number;
  currencySymbol?: string;
  onSaveReport: (report: WorkReport) => void;
  onCancel?: () => void;
  existingReport?: WorkReport | null;
}

export const WorkReportForm: React.FC<WorkReportFormProps> = ({
  equipmentList,
  companiesList,
  driversList,
  projectItems = [],
  defaultDieselPrice = 2.3,
  currencySymbol = 'ر.ي',
  onSaveReport,
  onCancel,
  existingReport
}) => {
  // 1. Basic Information
  const [reportNumber, setReportNumber] = useState(
    existingReport?.reportNumber || `REP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [date, setDate] = useState(
    existingReport?.date || new Date().toISOString().split('T')[0]
  );
  const [contractType, setContractType] = useState<ContractType>(
    existingReport?.contractType || ''
  );
  const [selectedEquipmentName, setSelectedEquipmentName] = useState(
    existingReport?.equipmentName || (equipmentList[0]?.name || '')
  );
  const [selectedCompanyName, setSelectedCompanyName] = useState(
    existingReport?.companyName || (companiesList[0]?.name || '')
  );
  const [selectedDriverName, setSelectedDriverName] = useState(
    existingReport?.driverName || (driversList[0]?.name || '')
  );
  const [driverPhone, setDriverPhone] = useState(
    existingReport?.driverPhone || (driversList[0]?.phone || '')
  );
  const [driverSalaryType, setDriverSalaryType] = useState(
    existingReport?.driverSalaryType || 'يومية'
  );

  // Auto fill equipment & driver info on selection
  useEffect(() => {
    const eq = equipmentList.find(e => e.name === selectedEquipmentName);
    if (eq) {
      if (eq.companyName) setSelectedCompanyName(eq.companyName);
      if (!existingReport && eq.defaultContractType) {
        setContractType(eq.defaultContractType);
      }
    }
  }, [selectedEquipmentName, equipmentList, existingReport]);

  useEffect(() => {
    const dr = driversList.find(d => d.name === selectedDriverName);
    if (dr) {
      setDriverPhone(dr.phone);
      setDriverSalaryType(dr.salaryType);
    }
  }, [selectedDriverName, driversList]);

  // 2. Work Shift Periods (up to 3 periods)
  const [periods, setPeriods] = useState<WorkPeriod[]>(
    existingReport?.periods || [
      {
        id: 'p-1',
        periodName: 'الفترة الأولى',
        startTime: '07:00',
        endTime: '12:00',
        durationHours: 5,
        breakMinutes: 0,
        netHours: 5,
        notes: ''
      }
    ]
  );

  // 3. Counter & Meters
  const [meterStart, setMeterStart] = useState<number>(existingReport?.meterStart || 1000);
  const [meterEnd, setMeterEnd] = useState<number>(existingReport?.meterEnd || 1008);
  const [quantityMeters, setQuantityMeters] = useState<number>(existingReport?.quantityMeters || 0);

  // 4. Financial Rates
  const [ratePerUnit, setRatePerUnit] = useState<number>(existingReport?.ratePerUnit || 1200);

  // Auto set default rate based on contract type & equipment
  useEffect(() => {
    const eq = equipmentList.find(e => e.name === selectedEquipmentName);
    if (!eq) return;
    if (contractType === 'daily') setRatePerUnit(eq.dailyRate || 1200);
    else if (contractType === 'hourly') setRatePerUnit(eq.hourlyRate || 180);
    else if (contractType === 'monthly') setRatePerUnit(Math.round((eq.monthlyRate || 30000) / 26));
    else if (contractType === 'meter') setRatePerUnit(eq.meterRate || 40);
    else if (contractType === 'salary') setRatePerUnit(150);
  }, [contractType, selectedEquipmentName, equipmentList]);

  // 5. Operational Costs
  const [costs, setCosts] = useState<OperationalCosts>(
    existingReport?.costs || {
      dieselLiters: 0,
      dieselCostPerLiter: defaultDieselPrice || 2.3,
      dieselTotalCost: 0,
      dieselOnLessor: false,
      oilCost: 0,
      hydraulicOilCost: 0,
      engineOilCost: 0,
      engineOilOnLessor: false,
      greaseCost: 0,
      sparePartsCost: 0,
      maintenanceCost: 0
    }
  );
  
  const [hasCosts, setHasCosts] = useState<boolean>(
    existingReport ? (
      (existingReport.costs.dieselLiters > 0) || 
      (existingReport.costs.hydraulicOilCost! > 0) || 
      (existingReport.costs.engineOilCost! > 0) || 
      (existingReport.costs.greaseCost > 0) || 
      (existingReport.costs.sparePartsCost > 0) || 
      (existingReport.costs.maintenanceCost > 0)
    ) : false
  );

  // 6. Driver Advance, Work Item & Completed Quantity
  const [driverAdvance, setDriverAdvance] = useState<number>(existingReport?.driverAdvance || 150);
  const [workLocation, setWorkLocation] = useState<string>(existingReport?.workLocation || '');
  const [workItem, setWorkItem] = useState<string>(existingReport?.workItem || '');
  const [completedQuantity, setCompletedQuantity] = useState<number | string>(
    existingReport?.completedQuantity !== undefined && existingReport?.completedQuantity !== null
      ? existingReport.completedQuantity
      : ''
  );
  const [itemUnit, setItemUnit] = useState<string>(existingReport?.itemUnit || '');
  const [notes, setNotes] = useState<string>(existingReport?.notes || '');

  // Auto set item unit when work item changes
  useEffect(() => {
    if (workItem && projectItems && projectItems.length > 0) {
      const matched = projectItems.find(i => i.name === workItem);
      if (matched && matched.unit) {
        setItemUnit(matched.unit);
      }
    }
  }, [workItem, projectItems]);

  // 7. Digital Signature Canvas States & Handlers (Driver & Supervisor)
  const driverCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const supervisorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingDriver, setIsDrawingDriver] = useState(false);
  const [isDrawingSupervisor, setIsDrawingSupervisor] = useState(false);
  const [driverSignature, setDriverSignature] = useState<string | undefined>(existingReport?.driverSignature);
  const [supervisorSignature, setSupervisorSignature] = useState<string | undefined>(existingReport?.supervisorSignature);
  const [supervisorName, setSupervisorName] = useState<string>(existingReport?.supervisorName || '');

  // 8. Site Photos State & Camera Handlers
  const [sitePhotos, setSitePhotos] = useState<string[]>(existingReport?.sitePhotos || []);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewingPhoto, setPreviewingPhoto] = useState<string | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error('Video play error:', e));
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('تعذر فتح الكاميرا المباشرة. يرجى استخدام زر "رفع صور من الكاميرا/الجهاز".');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setSitePhotos(prev => [...prev, photoDataUrl]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setSitePhotos((prev) => [...prev, compressed]);
          }
        };
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setSitePhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Handle shift period recalculations
  const updatePeriod = (index: number, field: keyof WorkPeriod, value: any) => {
    const updated = [...periods];
    const item = { ...updated[index], [field]: value };

    // Calculate duration if times changed
    if (field === 'startTime' || field === 'endTime' || field === 'breakMinutes') {
      if (item.startTime && item.endTime) {
        const [sh, sm] = item.startTime.split(':').map(Number);
        const [eh, em] = item.endTime.split(':').map(Number);
        let startMinutes = sh * 60 + sm;
        let endMinutes = eh * 60 + em;
        if (endMinutes < startMinutes) endMinutes += 24 * 60; // Cross midnight
        const diffMinutes = endMinutes - startMinutes - (item.breakMinutes || 0);
        item.durationHours = parseFloat((Math.max(0, diffMinutes) / 60).toFixed(2));
        item.netHours = item.durationHours;
      }
    }

    updated[index] = item;
    setPeriods(updated);
  };

  const addPeriod = () => {
    if (periods.length >= 3) return;
    const nextName = periods.length === 1 ? 'الفترة الثانية' : 'الفترة الثالثة';
    setPeriods([
      ...periods,
      {
        id: `p-${Date.now()}`,
        periodName: nextName,
        startTime: '13:00',
        endTime: '17:00',
        durationHours: 4,
        breakMinutes: 0,
        netHours: 4,
        notes: ''
      }
    ]);
  };

  const removePeriod = (index: number) => {
    if (periods.length <= 1) return;
    setPeriods(periods.filter((_, i) => i !== index));
  };

  // Sum of total net work hours across all periods
  const totalNetHours = periods.reduce((acc, p) => acc + (p.netHours || 0), 0);

  // Financial gross calculation based on contract type
  let grossAmount = 0;
  if (contractType === 'daily' || contractType === 'salary' || contractType === 'monthly') {
    grossAmount = ratePerUnit;
  } else if (contractType === 'hourly') {
    grossAmount = totalNetHours * ratePerUnit;
  } else if (contractType === 'meter') {
    grossAmount = (quantityMeters || 0) * ratePerUnit;
  }

  // Net due from company (Gross Amount - Driver Advance credited to company)
  const netCompanyDue = Math.max(0, grossAmount - (driverAdvance || 0));

  // Helper to accurately extract pointer coordinates on scaling touch/mouse canvas
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && (e as any).changedTouches.length > 0) {
      clientX = (e as any).changedTouches[0].clientX;
      clientY = (e as any).changedTouches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Driver Canvas Drawing Handlers
  const startDrawingDriver = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = driverCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawingDriver(true);
    const { x, y } = getCanvasCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawDriver = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingDriver) return;
    const canvas = driverCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e, canvas);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingDriver = () => {
    if (!isDrawingDriver) return;
    setIsDrawingDriver(false);
    const canvas = driverCanvasRef.current;
    if (canvas) {
      setDriverSignature(canvas.toDataURL('image/png'));
    }
  };

  const clearDriverCanvas = () => {
    const canvas = driverCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setDriverSignature(undefined);
  };

  // Supervisor Canvas Drawing Handlers
  const startDrawingSupervisor = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = supervisorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawingSupervisor(true);
    const { x, y } = getCanvasCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawSupervisor = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSupervisor) return;
    const canvas = supervisorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e, canvas);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingSupervisor = () => {
    if (!isDrawingSupervisor) return;
    setIsDrawingSupervisor(false);
    const canvas = supervisorCanvasRef.current;
    if (canvas) {
      setSupervisorSignature(canvas.toDataURL('image/png'));
    }
  };

  const clearSupervisorCanvas = () => {
    const canvas = supervisorCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSupervisorSignature(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedEquipment = equipmentList.find(e => e.name === selectedEquipmentName);

    const report: WorkReport = {
      id: existingReport?.id || `wr-${Date.now()}`,
      reportNumber,
      date,
      contractType,
      companyName: selectedCompanyName,
      equipmentName: selectedEquipmentName,
      equipmentRegNumber: selectedEquipment?.regNumber || 'أ ب ج 1234',
      driverName: selectedDriverName,
      driverPhone,
      driverSalaryType,
      periods,
      totalNetHours,
      ratePerUnit,
      meterStart,
      meterEnd,
      quantityMeters: contractType === 'meter' ? quantityMeters : (meterEnd - meterStart),
      grossAmount,
      costs: hasCosts ? {
        ...costs,
        dieselTotalCost: (costs.dieselLiters || 0) * (costs.dieselCostPerLiter || 2.3)
      } : {
        dieselLiters: 0,
        dieselCostPerLiter: 0,
        dieselTotalCost: 0,
        dieselOnLessor: false,
        oilCost: 0,
        hydraulicOilCost: 0,
        engineOilCost: 0,
        engineOilOnLessor: false,
        greaseCost: 0,
        sparePartsCost: 0,
        maintenanceCost: 0
      },
      driverAdvance,
      netCompanyDue,
      sitePhotos,
      driverSignature,
      supervisorSignature,
      supervisorName,
      workLocation,
      workItem,
      completedQuantity: Number(completedQuantity) || 0,
      itemUnit: itemUnit || '',
      notes,
      createdAt: existingReport?.createdAt || new Date().toISOString()
    };

    onSaveReport(report);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Form Title & Top Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-amber-500" />
            <span>تسجيل يوم عمل جديد (سجل تشغيل معدة)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            يرجى إدخال كافة بيانات الوردية، فترات العمل، السلفة، والتكاليف بدقة متناهية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">رقم التقرير:</span>
          <input
            type="text"
            value={reportNumber}
            onChange={(e) => setReportNumber(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-black text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center w-36"
            required
          />
        </div>
      </div>

      {/* Contract Mode Selector Bar */}
      {/* Contract Type Selection */}
      {(() => {
        const eq = equipmentList.find(e => e.name === selectedEquipmentName);
        const hasDefault = Boolean(eq && eq.defaultContractType);
        
        if (hasDefault) {
          return (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  المعدة مرتبطة بعقد افتراضي
                </label>
                <div className="text-sm text-slate-500">تم اختيار نوع العقد تلقائياً</div>
              </div>
              <div className="bg-amber-100 text-amber-800 font-extrabold px-4 py-2 rounded-xl text-sm border border-amber-200">
                {contractType === 'daily' && 'عقد يومي'}
                {contractType === 'hourly' && 'عقد بالساعة'}
                {contractType === 'meter' && 'عقد بالمتر'}
                {contractType === 'monthly' && 'عقد شهري'}
                {contractType === 'salary' && 'عقد براتب'}
              </div>
            </div>
          );
        }

        return (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <label className="text-xs font-black text-slate-700 block flex justify-between">
              <span>اختيار نوع العقد التشغيلي (اختياري)</span>
              {contractType !== '' && (
                <button type="button" onClick={() => setContractType('')} className="text-slate-400 hover:text-slate-700 underline text-[10px]">
                  إلغاء التحديد
                </button>
              )}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'daily', label: 'عقد يومي', sub: 'مبلغ مقطوع باليوم' },
                { id: 'hourly', label: 'عقد بالساعة', sub: 'حساب دقيق بالساعات' },
                { id: 'meter', label: 'عقد بالمتر', sub: 'حساب الكميات بالأنظار' },
                { id: 'monthly', label: 'عقد شهري', sub: 'حساب النسبة اليومية' },
                { id: 'salary', label: 'عقد براتب', sub: 'ساعات عمل راتب' }
              ].map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setContractType(mode.id as ContractType)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    contractType === mode.id
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                  }`}
                >
                  <div className="text-sm">{mode.label}</div>
                  <div className={`text-[10px] mt-0.5 ${contractType === mode.id ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    {mode.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Main Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Date & Company Selection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
            <span>بيانات التاريخ والشركة</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">التاريخ:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">اسم المعدة:</label>
            <select
              value={selectedEquipmentName}
              onChange={(e) => setSelectedEquipmentName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.name}>{eq.name} ({eq.regNumber})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">الشركة المؤجرة:</label>
            <select
              value={selectedCompanyName}
              onChange={(e) => setSelectedCompanyName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {companiesList.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Driver Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
            <span>بيانات السائق والسُلفة</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">اسم السائق:</label>
            <select
              value={selectedDriverName}
              onChange={(e) => setSelectedDriverName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {driversList.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">رقم الجوال:</label>
            <input
              type="text"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-amber-700 mb-1 block">السلفة اليومية للسائق (تُقيد على الشركة):</label>
            <div className="relative">
              <input
                type="number"
                value={driverAdvance}
                onChange={(e) => setDriverAdvance(parseFloat(e.target.value) || 0)}
                className="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-black text-amber-700 focus:ring-2 focus:ring-amber-500 focus:outline-none pl-12"
                placeholder="0"
              />
              <span className="absolute left-3 top-2.5 text-xs font-bold text-amber-600">ر.س</span>
            </div>
            <CostAttachmentInput
              labelName="سلفة السائق"
              notesValue={costs.driverAdvanceNotes}
              onNotesChange={(val) => setCosts({ ...costs, driverAdvanceNotes: val })}
              attachmentValue={costs.driverAdvanceAttachment}
              onAttachmentChange={(val) => setCosts({ ...costs, driverAdvanceAttachment: val })}
            />
          </div>
        </div>

        {/* Counter Meters & Financial Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-600" />
            <span>عداد الساعات والأسعار</span>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">عداد بداية:</label>
              <input
                type="number"
                value={meterStart}
                onChange={(e) => setMeterStart(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">عداد نهاية:</label>
              <input
                type="number"
                value={meterEnd}
                onChange={(e) => setMeterEnd(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>
          </div>

          {contractType === 'meter' && (
            <div>
              <label className="text-xs font-bold text-emerald-700 mb-1 block">كمية الأمتار الإنجاز:</label>
              <input
                type="number"
                value={quantityMeters}
                onChange={(e) => setQuantityMeters(parseFloat(e.target.value) || 0)}
                className="w-full bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2 text-xs font-black text-emerald-800"
                placeholder="أدخل عدد الأمتار"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              {contractType === 'daily' && 'سعر اليومية الإجمالي (ر.س):'}
              {contractType === 'hourly' && 'سعر التشغيل بالساعة للمعدة (ر.س/ساعة):'}
              {contractType === 'meter' && 'سعر المتر المربع/المكعب (ر.س):'}
              {contractType === 'monthly' && 'المعدل اليومي للعقد الشهري (ر.س):'}
              {contractType === 'salary' && 'قيمة يوم عمل الراتب (ر.س):'}
            </label>
            <input
              type="number"
              value={ratePerUnit}
              onChange={(e) => setRatePerUnit(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-amber-500"
              required
            />

            {/* Auto Total Cost Calculation Callout */}
            <div className="mt-3 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 text-xs text-amber-950 font-bold space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>ساعات التشغيل الفعالة:</span>
                <span className="font-extrabold text-slate-900">{formatHoursDigital(totalNetHours)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>سعر التشغيل بالساعة:</span>
                <span className="font-extrabold text-slate-900">{ratePerUnit} ر.س</span>
              </div>
              <div className="flex items-center justify-between border-t border-amber-300/60 pt-1.5 text-xs font-black text-amber-900">
                <span>التكلفة الإجمالية تلقائياً (الساعات × السعر):</span>
                <span className="text-sm font-black text-emerald-700">{grossAmount.toLocaleString('ar-SA')} ر.س</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Work Shift Periods Section (Up to 3 Shift Periods) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>فترات وساعات العمل بالوردية</span>
            </h3>
            <p className="text-xs text-slate-500">حساب تلقائي لصافي الساعات وإتاحة حتى 3 فترات عمل يومياً</p>
          </div>

          {periods.length < 3 && (
            <button
              type="button"
              onClick={addPeriod}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-600" />
              <span>إضافة فترة أخرى</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {periods.map((p, idx) => (
            <div key={p.id} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-3 items-center">
              <div className="sm:col-span-1 font-bold text-xs text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{p.periodName}</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block">وقت البدء:</label>
                <input
                  type="time"
                  value={p.startTime}
                  onChange={(e) => updatePeriod(idx, 'startTime', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block">وقت الانتهاء:</label>
                <input
                  type="time"
                  value={p.endTime}
                  onChange={(e) => updatePeriod(idx, 'endTime', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block">خصم توقف (دقيقة):</label>
                <input
                  type="number"
                  value={p.breakMinutes}
                  onChange={(e) => updatePeriod(idx, 'breakMinutes', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold"
                />
              </div>

              <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 text-center">
                <span className="text-[10px] font-bold text-blue-600 block">الصافي:</span>
                <span className="text-sm font-extrabold text-blue-900">{p.netHours} ساعة</span>
              </div>

              <div className="flex items-center justify-end">
                {periods.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePeriod(idx)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between font-bold text-xs sm:text-sm">
          <span>مجموع ساعات الوردية الفعلية:</span>
          <span className="text-amber-400 text-base">{formatHoursDigital(totalNetHours)}</span>
        </div>
      </div>

      {/* Operational Costs Entry */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
          <Fuel className="w-4 h-4 text-amber-500" />
          <span>التكاليف التشغيلية ومصروفات اليوم</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Diesel Block */}
          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-950 block">الديزل (كمية اللترات):</label>
              <label className="text-[10px] font-bold text-amber-900 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={costs.dieselOnLessor || false}
                  onChange={(e) => setCosts({ ...costs, dieselOnLessor: e.target.checked })}
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <span>تقييده على الشركة المؤجرة</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-amber-800 font-bold block mb-0.5">اللترات المصروفة:</span>
                <input
                  type="number"
                  value={costs.dieselLiters}
                  onChange={(e) => setCosts({ ...costs, dieselLiters: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                  placeholder="مثال: 150"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-amber-800 font-bold block">سعر اللتر:</span>
                  <span className="text-[9px] text-amber-700 font-black bg-amber-200/80 px-1 rounded">ثابت بالمشروع</span>
                </div>
                <input
                  type="number"
                  value={costs.dieselCostPerLiter}
                  onChange={(e) => setCosts({ ...costs, dieselCostPerLiter: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-amber-100/60 border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            <p className="text-[10px] text-amber-800 font-medium">
              ⚡ تم تحديد سعر اللتر تلقائياً بـ <strong className="font-bold text-amber-950">{defaultDieselPrice} {currencySymbol}</strong> من بيانات تسجيل المشروع لتسريع ادخال التقارير.
            </p>

            <div className="text-[10px] font-extrabold text-amber-900 flex justify-between items-center border-t border-amber-200/80 pt-1.5">
              <span>إجمالي تكلفة الديزل:</span>
              <span className="text-amber-900 font-black">{(costs.dieselLiters * costs.dieselCostPerLiter).toFixed(2)} ر.س</span>
            </div>

            <CostAttachmentInput
              labelName="الديزل"
              notesValue={costs.dieselNotes}
              onNotesChange={(val) => setCosts({ ...costs, dieselNotes: val })}
              attachmentValue={costs.dieselAttachment}
              onAttachmentChange={(val) => setCosts({ ...costs, dieselAttachment: val })}
            />
          </div>

          {/* Hydraulic Oil (Always on Lessor) */}
          <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-sky-950 block">زيت الهيدروليك (ر.س):</label>
              <span className="bg-sky-200 text-sky-900 text-[9px] font-black px-1.5 py-0.5 rounded">
                دائماً خصم على الشركة المؤجرة
              </span>
            </div>
            <input
              type="number"
              value={costs.hydraulicOilCost || 0}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setCosts({ 
                  ...costs, 
                  hydraulicOilCost: val,
                  oilCost: val + (costs.engineOilCost || 0)
                });
              }}
              placeholder="0.00"
              className="w-full bg-white border border-sky-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
            />
            <p className="text-[10px] text-sky-800 font-bold">
              يتم خصم زيت الهيدروليك تلقائياً من الحساب المالي للشركة المؤجرة للمعدة.
            </p>

            <CostAttachmentInput
              labelName="زيت الهيدروليك"
              notesValue={costs.hydraulicOilNotes}
              onNotesChange={(val) => setCosts({ ...costs, hydraulicOilNotes: val })}
              attachmentValue={costs.hydraulicOilAttachment}
              onAttachmentChange={(val) => setCosts({ ...costs, hydraulicOilAttachment: val })}
            />
          </div>

          {/* Engine Oil (Optional: on Lessor vs on Project) */}
          <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-emerald-950 block">زيت المكينة (ر.س):</label>
              <label className="text-[10px] font-bold text-emerald-900 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={costs.engineOilOnLessor || false}
                  onChange={(e) => setCosts({ ...costs, engineOilOnLessor: e.target.checked })}
                  className="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                />
                <span>تقييده على الشركة المؤجرة</span>
              </label>
            </div>
            <input
              type="number"
              value={costs.engineOilCost || 0}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setCosts({ 
                  ...costs, 
                  engineOilCost: val,
                  oilCost: (costs.hydraulicOilCost || 0) + val
                });
              }}
              placeholder="0.00"
              className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
            />
            <p className="text-[10px] text-emerald-800 font-bold">
              {costs.engineOilOnLessor ? 'مقيّد خصماً على الشركة المؤجرة.' : 'على حساب المشروع (لا يخصم من الشركة).'}
            </p>

            <CostAttachmentInput
              labelName="زيت المكينة"
              notesValue={costs.engineOilNotes}
              onNotesChange={(val) => setCosts({ ...costs, engineOilNotes: val })}
              attachmentValue={costs.engineOilAttachment}
              onAttachmentChange={(val) => setCosts({ ...costs, engineOilAttachment: val })}
            />
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">مبلغ التشحيم (ر.س):</label>
            <input
              type="number"
              value={costs.greaseCost}
              onChange={(e) => setCosts({ ...costs, greaseCost: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
            />
            <CostAttachmentInput
              labelName="التشحيم"
              notesValue={costs.greaseNotes}
              onNotesChange={(val) => setCosts({ ...costs, greaseNotes: val })}
              attachmentValue={costs.greaseAttachment}
              onAttachmentChange={(val) => setCosts({ ...costs, greaseAttachment: val })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">قطع غيار وصيانة (ر.س):</label>
            <input
              type="number"
              value={costs.sparePartsCost}
              onChange={(e) => setCosts({ ...costs, sparePartsCost: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
            />
            <CostAttachmentInput
              labelName="قطع الغيار والصيانة"
              notesValue={costs.sparePartsNotes}
              onNotesChange={(val) => setCosts({ ...costs, sparePartsNotes: val })}
              attachmentValue={costs.sparePartsAttachment}
              onAttachmentChange={(val) => setCosts({ ...costs, sparePartsAttachment: val })}
            />
          </div>
        </div>
      </div>

      {/* Final Financial Summary & Signature Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Real-time Calculation Summary Box */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg border border-slate-700 space-y-3.5">
          <h3 className="font-black text-amber-400 text-sm flex items-center gap-2 border-b border-slate-700 pb-2">
            <Calculator className="w-4 h-4" />
            <span>ملخص الاحتساب المالي لليوم</span>
          </h3>

          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>إجمالي المستحق من الشركة:</span>
            <span className="font-extrabold text-white text-sm">{grossAmount} ر.س</span>
          </div>

          <div className="flex justify-between items-center text-xs text-amber-300">
            <span>تخصم السلفة اليومية للسائق:</span>
            <span className="font-extrabold text-amber-400 text-sm">- {driverAdvance} ر.س</span>
          </div>

          <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-200">الصافي المتبقي للشركة:</span>
            <span className="text-xl font-black text-emerald-400">{netCompanyDue} ر.س</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">موقع العمل:</label>
              <input
                type="text"
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="مثال: البلوك A, القطاع 2..."
              />
            </div>
            <div>
              <label className="text-[11px] text-amber-300 font-extrabold block mb-1 flex items-center justify-between">
                <span>بند العمل بالمشروع (لقياس التكاليف والإنتاجية):</span>
                {projectItems && projectItems.length > 0 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 font-bold">
                    {projectItems.length} بنود معتمدة بالمشروع
                  </span>
                )}
              </label>

              {projectItems && projectItems.length > 0 ? (
                <div className="bg-slate-900 border border-amber-500/40 p-3 rounded-xl space-y-3">
                  {/* Select main item or enable multi-allocation */}
                  <div className="space-y-2">
                    <select
                      value={workItem}
                      onChange={(e) => setWorkItem(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/60 rounded-xl p-2.5 text-xs text-amber-300 font-extrabold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-inner"
                    >
                      <option value="">-- اختر بند العمل المحدد لهذا التقرير --</option>
                      {projectItems.map(item => (
                        <option key={item.id} value={item.name}>
                          {item.code ? `[${item.code}] ` : ''}{item.name} {item.unit ? `(${item.unit})` : ''} - (ميزانية: {(item.estimatedBudget || 0).toLocaleString('ar-SA')} {currencySymbol})
                        </option>
                      ))}
                      <option value="بند آخر غير مدرج">بند أخر (كتابة يدويّة)...</option>
                    </select>

                    {/* Manual input fallback if "بند آخر" or custom name */}
                    {(!workItem || !projectItems.some(i => i.name === workItem)) && (
                      <input
                        type="text"
                        value={workItem}
                        onChange={(e) => setWorkItem(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="أدخل اسم البند يدوياً..."
                      />
                    )}
                  </div>

                  {/* Selected Item Detail Badge & Live Cost Allocation Preview */}
                  {projectItems.some(i => i.name === workItem) && (() => {
                    const selectedItemObj = projectItems.find(i => i.name === workItem);
                    if (!selectedItemObj) return null;
                    const shiftNetHours = totalNetHours || 0;
                    const shiftGross = grossAmount || 0;
                    const shiftDieselCost = (costs.dieselLiters || 0) * (costs.dieselCostPerLiter || defaultDieselPrice || 2.3);
                    const shiftMaintenanceCost = (costs.oilCost || 0) + (costs.greaseCost || 0) + (costs.sparePartsCost || 0) + (costs.maintenanceCost || 0);
                    const shiftTotalCost = shiftDieselCost + shiftMaintenanceCost;

                    return (
                      <div className="bg-slate-950/90 border border-amber-500/30 p-2.5 rounded-lg space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-800 pb-1.5">
                          <div className="flex items-center gap-1.5 text-amber-300">
                            <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded font-black">
                              {selectedItemObj.code || 'ITEM'}
                            </span>
                            <span>{selectedItemObj.name}</span>
                          </div>
                          <span className="text-slate-400">
                            الوحدة: <strong className="text-slate-200">{selectedItemObj.unit || 'م3'}</strong>
                          </span>
                        </div>

                        {/* Live Allocation Metrics for this shift */}
                        <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center font-bold">
                          <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-400 block">الساعات المخصصة:</span>
                            <span className="text-amber-300 text-xs font-black">{shiftNetHours} ساعة</span>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-400 block">التكلفة المباشرة:</span>
                            <span className="text-rose-400 text-xs font-black">{shiftTotalCost.toLocaleString('ar-SA')} {currencySymbol}</span>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-400 block">قيمة الإنجاز:</span>
                            <span className="text-emerald-400 text-xs font-black">{shiftGross.toLocaleString('ar-SA')} {currencySymbol}</span>
                          </div>
                        </div>

                        {/* Completed Quantity Input Section */}
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-amber-500/30 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-6">
                            <label className="text-[10px] font-black text-amber-300 block mb-0.5">
                              كمية الإنجاز المنفذة للبند لهذا التقرير:
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={completedQuantity}
                              onChange={(e) => setCompletedQuantity(e.target.value)}
                              placeholder={`مثال: 250 (${selectedItemObj.unit || 'م3'})`}
                              className="w-full bg-slate-950 border border-amber-500/50 rounded-lg p-1.5 text-xs text-white font-extrabold focus:outline-none focus:ring-1 focus:ring-amber-400"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                              وحدة القياس:
                            </label>
                            <input
                              type="text"
                              value={itemUnit || selectedItemObj.unit || ''}
                              onChange={(e) => setItemUnit(e.target.value)}
                              placeholder="م3، م2، إلخ"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200 font-bold focus:outline-none"
                            />
                          </div>

                          <div className="sm:col-span-3 text-center bg-slate-950 p-1.5 rounded border border-slate-800">
                            <span className="text-[9px] font-bold text-slate-400 block">تكلفة الوحدة المنجزة:</span>
                            {Number(completedQuantity) > 0 ? (
                              <span className="text-xs font-black text-amber-300 block">
                                {(shiftTotalCost / Number(completedQuantity)).toFixed(2)} {currencySymbol}/{itemUnit || selectedItemObj.unit || 'وحدة'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 block">أدخل الكمية للحساب</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Quick Select Pill Buttons for project items */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">اختيار سريع للبند:</span>
                    <div className="flex flex-wrap gap-1">
                      {projectItems.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setWorkItem(item.name)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                            workItem === item.name
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                              : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-amber-500/50 hover:text-amber-300'
                          }`}
                        >
                          {item.code ? `${item.code} | ` : ''}{item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={workItem}
                  onChange={(e) => setWorkItem(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="مثال: حفر أساسات، تسوية، نقل ردميات..."
                />
              )}
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-bold block mb-1">ملاحظات حقل العمل:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="اكتب أي ملاحظات تتعلق بظروف العمل أو التوقفات..."
            />
          </div>
        </div>

        {/* Field Site Photos Section */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-amber-400 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>الصور الميدانية وتوثيق موقع العمل ({sitePhotos.length})</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                التقط صوراً بالمباشر من كاميرا الهاتف/الموقع أو أرفق صور الأعمال المنجزة لربطها بالتقرير.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startCamera}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>الكاميرا المباشرة 📸</span>
              </button>

              <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>رفع / اختيار صور</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {cameraError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Captured Photos Grid */}
          {sitePhotos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sitePhotos.map((photo, idx) => (
                <div key={idx} className="relative group bg-slate-950 rounded-xl overflow-hidden border border-slate-800 aspect-video flex items-center justify-center">
                  <img
                    src={photo}
                    alt={`صورة ميدانية ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewingPhoto(photo)}
                      className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold text-xs hover:bg-amber-400"
                      title="عرض المكبر"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="p-2 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-500"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-black">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-4 text-center">
              <Camera className="w-8 h-8 text-slate-600 mx-auto mb-1 opacity-50" />
              <p className="text-xs text-slate-400 font-medium">لم يتم التقاط أو إرفاق أي صور ميدانية لهذا التقرير بعد.</p>
              <p className="text-[10px] text-slate-500 mt-0.5">اضغط على "الكاميرا المباشرة" لالتقاط صور من موقع العمل فوراً.</p>
            </div>
          )}
        </div>

        {/* Electronic Digital Signatures Section (Driver & Supervisor) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-2 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <PenTool className="w-4 h-4 text-amber-600" />
                <span>التوقيع الإلكتروني الميداني (السائق والمشرف)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                يمكن للسائق والمهندس المشرف التوقيع المباشر بالإصبع أو القلم على الشاشة لتوثيق التقرير واعتماده بالـ PDF.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Driver Signature Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>توقيع السائق / المشغل ({selectedDriverName || 'السائق'})</span>
                </span>
                <button
                  type="button"
                  onClick={clearDriverCanvas}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>مسح التوقيع</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white relative overflow-hidden shadow-inner">
                <canvas
                  ref={driverCanvasRef}
                  width={450}
                  height={130}
                  onMouseDown={startDrawingDriver}
                  onMouseMove={drawDriver}
                  onMouseUp={stopDrawingDriver}
                  onMouseLeave={stopDrawingDriver}
                  onTouchStart={startDrawingDriver}
                  onTouchMove={drawDriver}
                  onTouchEnd={stopDrawingDriver}
                  className="w-full h-32 cursor-crosshair touch-none"
                />
                {!driverSignature && !isDrawingDriver && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-bold bg-slate-50/40">
                    ✍️ وقّع هنا بالإصبع أو اللمس (السائق)
                  </div>
                )}
              </div>
              {driverSignature && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تم التقاط توقيع السائق بنجاح</span>
                </div>
              )}
            </div>

            {/* 2. Supervisor / Engineer Signature Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>توقيع المشرف الميداني / المهندس</span>
                </span>
                <button
                  type="button"
                  onClick={clearSupervisorCanvas}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>مسح التوقيع</span>
                </button>
              </div>

              <div className="mb-1">
                <input
                  type="text"
                  placeholder="اسم المشرف / المهندس الميداني"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                />
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white relative overflow-hidden shadow-inner">
                <canvas
                  ref={supervisorCanvasRef}
                  width={450}
                  height={130}
                  onMouseDown={startDrawingSupervisor}
                  onMouseMove={drawSupervisor}
                  onMouseUp={stopDrawingSupervisor}
                  onMouseLeave={stopDrawingSupervisor}
                  onTouchStart={startDrawingSupervisor}
                  onTouchMove={drawSupervisor}
                  onTouchEnd={stopDrawingSupervisor}
                  className="w-full h-32 cursor-crosshair touch-none"
                />
                {!supervisorSignature && !isDrawingSupervisor && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-bold bg-slate-50/40">
                    ✍️ وقّع هنا بالإصبع أو اللمس (المشرف)
                  </div>
                )}
              </div>
              {supervisorSignature && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>تم التقاط توقيع المشرف بنجاح</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Live Camera Stream Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col space-y-4 p-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-amber-400 text-sm flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>الكاميرا المباشرة - التقاط صورة الموقع</span>
              </h3>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>مباشر LIVE</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                إغلاق الكاميرا
              </button>

              <button
                type="button"
                onClick={captureCameraPhoto}
                className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>التقاط الصورة الآن 📸</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Lightbox Preview */}
      {previewingPhoto && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewingPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <img src={previewingPhoto} alt="معاينة الصورة الميدانية" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            <button
              type="button"
              onClick={() => setPreviewingPhoto(null)}
              className="absolute top-3 left-3 bg-slate-900/80 text-white p-2 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Form Submit & Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm cursor-pointer"
          >
            إلغاء
          </button>
        )}
        
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black px-8 py-3.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-transform active:scale-95"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>حفظ واستخراج التقرير</span>
        </button>
      </div>

    </form>
  );
};
