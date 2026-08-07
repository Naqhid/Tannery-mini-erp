import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, SwitchCamera } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraIdx, setActiveCameraIdx] = useState(0);
  const containerId = 'barcode-scanner-container';

  // Supported 1D barcode formats for production cards
  const formatsToSupport = [
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.CODE_93,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.CODABAR,
    Html5QrcodeSupportedFormats.QR_CODE,
  ];

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const scanner = new Html5Qrcode(containerId, { formatsToSupport, verbose: false });
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!mounted) return;

        if (devices.length === 0) {
          setError('No camera found on this device.');
          return;
        }

        setCameras(devices);
        // Prefer back camera
        const backCamIdx = devices.findIndex(
          (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('environment')
        );
        const cameraIdx = backCamIdx >= 0 ? backCamIdx : 0;
        setActiveCameraIdx(cameraIdx);

        await scanner.start(
          devices[cameraIdx].id,
          {
            fps: 15,
            qrbox: { width: 450, height: 200 },
            aspectRatio: 1.5,
          },
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
            onClose();
          },
          () => { /* ignore scan failures */ }
        );
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || 'Unable to access camera. Please allow camera permissions.');
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      scannerRef.current?.clear();
    } catch {
      // ignore cleanup errors
    }
  };

  const switchCamera = async () => {
    if (cameras.length < 2) return;
    const nextIdx = (activeCameraIdx + 1) % cameras.length;
    setActiveCameraIdx(nextIdx);

    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      await scannerRef.current?.start(
        cameras[nextIdx].id,
        {
          fps: 15,
          qrbox: { width: 450, height: 200 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        () => {}
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to switch camera.');
    }
  };

  const handleClose = () => {
    stopScanner();
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-900">Scan Barcode</h3>
          </div>
          <div className="flex items-center gap-2">
            {cameras.length > 1 && (
              <button
                onClick={switchCamera}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Switch Camera"
              >
                <SwitchCamera className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Scanner Area */}
        <div className="p-4">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <Camera className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm text-red-600 font-medium mb-1">Camera Error</p>
              <p className="text-xs text-gray-500 max-w-xs">{error}</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black">
              <div id={containerId} className="w-full" style={{ minHeight: '350px' }} />
              <div className="absolute inset-0 pointer-events-none border-2 border-blue-400/30 rounded-xl" />
            </div>
          )}
          <p className="text-xs text-gray-500 text-center mt-3">
            Hold the barcode steady inside the frame. Keep the full barcode visible.
          </p>
        </div>
      </div>
    </div>
  );
}
