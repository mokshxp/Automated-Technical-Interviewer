import { useState, useEffect, useCallback } from 'react';

interface UseProctoringProps {
    onTerminate: () => void;
    enable: boolean;
}

interface ViolationState {
    tabHidden: number;
    windowBlur: number;
    fullscreenExit: number;
    devtoolsSuspected: number;
}

export const useProctoring = ({ onTerminate, enable }: UseProctoringProps) => {
    const [violationCount, setViolationCount] = useState(0);
    const [warning, setWarning] = useState<string | null>(null);
    const [terminated, setTerminated] = useState(false);
    const [violations, setViolations] = useState<ViolationState>({
        tabHidden: 0,
        windowBlur: 0,
        fullscreenExit: 0,
        devtoolsSuspected: 0
    });

    const handleViolation = useCallback((type: keyof ViolationState, soft = false) => {
        if (terminated || !enable) return;

        setViolations(prev => ({ ...prev, [type]: prev[type] + 1 }));

        if (!soft) {
            setViolationCount(prev => {
                const newCount = prev + 1;

                if (newCount === 1) {
                    setWarning("⚠️ Warning: Please stay on the interview screen. Switching tabs or apps again will terminate your session.");
                } else if (newCount >= 2) {
                    setTerminated(true);
                    setWarning("🚫 Interview Terminated due to repeated violations.");
                    onTerminate();
                }

                return newCount;
            });
        }
    }, [terminated, onTerminate, enable]);

    // 1. Fullscreen Enforcement
    useEffect(() => {
        if (!enable) return;

        const enforceFullscreen = async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (e) {
                console.warn("Fullscreen request denied or failed", e);
            }
        };

        enforceFullscreen();

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                handleViolation("fullscreenExit");
                // Try to re-enter? Maybe too aggressive. Just warn for now.
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [enable, handleViolation]);

    // 2. Tab Switching (Visibility)
    useEffect(() => {
        if (!enable) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleViolation("tabHidden");
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [enable, handleViolation]);

    // 3. Window Blur
    useEffect(() => {
        if (!enable) return;

        const handleBlur = () => {
            handleViolation("windowBlur");
        };

        window.addEventListener("blur", handleBlur);
        return () => window.removeEventListener("blur", handleBlur);
    }, [enable, handleViolation]);

    // 4. DevTools Detection (Heuristic - Resize)
    useEffect(() => {
        if (!enable) return;

        const handleResize = () => {
            const threshold = 160;
            if (
                window.outerWidth - window.innerWidth > threshold ||
                window.outerHeight - window.innerHeight > threshold
            ) {
                handleViolation("devtoolsSuspected", true); // Soft violation
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [enable, handleViolation]);

    // Clear warning after delay
    useEffect(() => {
        if (warning && !terminated) {
            const timer = setTimeout(() => setWarning(null), 5000); // 5s warning toast
            return () => clearTimeout(timer);
        }
    }, [warning, terminated]);

    return { warning, terminated, violations, violationCount };
};
