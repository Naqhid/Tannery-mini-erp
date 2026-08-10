import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, SwitchCamera, FlashlightOff, Flashlight } from 'lucide-react';

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
  const [torchOn, setTorchOn] = useState(false);
  const containerId = 'barcode-scanner-container';

  // Support all common 1D and 2D barcode formats
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
    Html5QrcodeSupportedFormats.DATA_MATRIX,
  ];

  const scanConfig = {
    fps: 20,
    qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
      // Use 90% of width and 50% of height for barcode scanning area
      const width = Math.min(Math.floor(viewfinderWidth * 0.9), 600);
      const height = Math.min(Math.floor(viewfinderHeight * 0.5), 250);
      return { width, height };
    },
    disableFlip: false,
  };

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const scanner = new Html5Qrcode(containerId, {
      formatsToSupport,
      verbose: false,
    });
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
        // Prefer back/environment camera
        const backCamIdx = devices.findIndex(
          (d) =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
        );
        const cameraIdx = backCamIdx >= 0 ? backCamIdx : 0;
        setActiveCameraIdx(cameraIdx);

        await scanner.start(
          devices[cameraIdx].id,
          scanConfig,
          (decodedText) => {
            try {
              onScan(decodedText);
            } catch (e) {
              console.error('onScan error:', e);
            }
            stopScanner();
            onClose();
          },
          () => {}
        );
      } catch (err: any) {
        if (mounted) {
          // If specific camera fails, try with facingMode constraint
          try {
            await scanner.start(
              { facingMode: 'environment' },
              scanConfig,
              (decodedText) => {
                try {
                  onScan(decodedText);
                } catch (e) {
                  console.error('onScan error:', e);
                }
                stopScanner();
                onClose();
              },
              () => {}
            );
          } catch (fallbackErr: any) {
            setError(
              fallbackErr?.message || 'Unable to access camera. Please allow camera permissions.'
            );
          }
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
        scanConfig,
        (decodedText) => {
          try {
            onScan(decodedText);
          } catch (e) {
            console.error('onScan error:', e);
          }
          stopScanner();
          onClose();
        },
        () => {}
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to switch camera.');
    }
  };

  const toggleTorch = async () => {
    try {
      const track = scannerRef.current?.getRunningTrackCameraCapabilities();
      if (track?.torchFeature()?.isSupported()) {
        const newState = !torchOn;
        await track.torchFeature().apply(newState);
        setTorchOn(newState);
      }
    } catch {
      // Torch not supported on this device
    }
  };

  const handleClose = () => {
    stopScanner();
    setError(null);
    setTorchOn(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-900">Scan Barcode</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTorch}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Toggle Flashlight"
            >
              {torchOn ? (
                <Flashlight className="w-5 h-5 text-yellow-500" />
              ) : (
                <FlashlightOff className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {cameras.length > 1 && (
              <button
                onClick={switchCamera}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Switch Camera"
              >
                <SwitchCamera className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Scanner Area */}
        <div className="p-3">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <Camera className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm text-red-600 font-medium mb-1">Camera Error</p>
              <p className="text-xs text-gray-500 max-w-xs">{error}</p>
              <button
                onClick={handleClose}
                className="mt-4 px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black">
              <div id={containerId} className="w-full" style={{ minHeight: '380px' }} />
            </div>
          )}
          <p className="text-xs text-gray-500 text-center mt-2">
            Align the barcode within the highlighted area. Keep steady until detected.
          </p>
        </div>
      </div>
    </div>
  );
}
