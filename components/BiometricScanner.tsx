import React, { useEffect, useRef, useState } from "react";

interface BiometricScannerProps {
  onComplete: (success: boolean) => void;
}

export const BiometricScanner: React.FC<BiometricScannerProps> = ({
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<
    "INITIALIZING" | "SCANNING" | "SUCCESS" | "ERROR" | "PERMISSION_DENIED"
  >("INITIALIZING");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timeoutId: NodeJS.Timeout;
    let scanTimeoutId: NodeJS.Timeout;

    const startCamera = async () => {
      try {
        console.log("[BiometricScanner] Requesting camera access...");

        // Request camera with specific constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });

        console.log("[BiometricScanner] Camera access granted");

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus("SCANNING");

          // Simulate scanning duration
          scanTimeoutId = setTimeout(() => {
            setStatus("SUCCESS");
            timeoutId = setTimeout(() => {
              console.log(
                "[BiometricScanner] Biometric verification successful"
              );
              onComplete(true);
            }, 1500);
          }, 3500);
        }
      } catch (err: any) {
        console.error("[BiometricScanner] Camera error:", err);

        let errorMsg = "Camera access failed";
        let statusType: "ERROR" | "PERMISSION_DENIED" = "ERROR";

        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          errorMsg =
            "Camera permission denied. Please enable camera access in your browser settings.";
          statusType = "PERMISSION_DENIED";
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          errorMsg = "No camera device found. Please connect a camera.";
        } else if (err.name === "NotReadableError") {
          errorMsg = "Camera is in use by another application.";
        } else if (err.name === "SecurityError") {
          errorMsg =
            "Camera access blocked by security policy. Use HTTPS or localhost.";
        }

        setErrorMessage(errorMsg);
        setStatus(statusType);
        timeoutId = setTimeout(() => {
          console.log(
            "[BiometricScanner] Biometric verification failed:",
            errorMsg
          );
          onComplete(false);
        }, 3000);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (timeoutId) clearTimeout(timeoutId);
      if (scanTimeoutId) clearTimeout(scanTimeoutId);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-95 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl flex flex-col items-center">
        <h2 className="text-xl font-semibold text-white mb-4">
          Identity Verification
        </h2>

        <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-bank-500 bg-black">
          {/* Camera Feed */}
          {status !== "PERMISSION_DENIED" && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          )}

          {/* Scanning Overlay */}
          {status === "SCANNING" && (
            <>
              <div className="absolute inset-0 bg-bank-500 opacity-20 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-scan"></div>

              {/* Face Target Frame */}
              <div className="absolute inset-0 border-[30px] border-black opacity-40 rounded-full"></div>
            </>
          )}

          {/* Success Overlay */}
          {status === "SUCCESS" && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-80">
              <svg
                className="w-20 h-20 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}

          {/* Permission Denied Overlay */}
          {status === "PERMISSION_DENIED" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500 bg-opacity-80 p-4">
              <svg
                className="w-12 h-12 text-white mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-white font-bold text-sm text-center">
                Permission Denied
              </span>
            </div>
          )}

          {/* Error Overlay */}
          {status === "ERROR" && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-80">
              <span className="text-white font-bold text-center text-sm px-4">
                Camera Access Error
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          {status === "INITIALIZING" && (
            <p className="text-gray-400">Accessing secure camera...</p>
          )}
          {status === "SCANNING" && (
            <p className="text-cyan-400 animate-pulse">
              Scanning facial biometrics...
            </p>
          )}
          {status === "SUCCESS" && (
            <p className="text-green-400 font-bold">Identity Verified</p>
          )}
          {status === "ERROR" && (
            <p className="text-red-400 text-sm">
              {errorMessage || "Camera access failed"}
            </p>
          )}
          {status === "PERMISSION_DENIED" && (
            <div className="text-red-400 text-sm space-y-2">
              <p className="font-bold">Camera Permission Required</p>
              <p className="text-xs text-gray-300">
                Please enable camera access in your browser settings and refresh
                the page.
              </p>
            </div>
          )}
        </div>

        {/* Retry Button for Demo/Testing */}
        {(status === "ERROR" || status === "PERMISSION_DENIED") && (
          <div className="mt-4 space-y-2 w-full">
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-bank-600 hover:bg-bank-500 text-white rounded-lg text-sm font-medium transition"
            >
              Retry Camera Access
            </button>
            <button
              onClick={() => {
                console.log("[BiometricScanner] Skipping to demo mode");
                setStatus("SUCCESS");
                setTimeout(() => {
                  onComplete(true);
                }, 1500);
              }}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition"
            >
              Continue (Demo Mode)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
