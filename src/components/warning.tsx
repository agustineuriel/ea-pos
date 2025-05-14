import { AlertTriangle } from "lucide-react"; // Import the warning icon

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const WarningPopup = ({
    isOpen,
    onClose,
    title,
    description,
    onConfirm,
    confirmText = "Continue",
    cancelText = "Cancel",
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        <span className="flex items-start gap-2"> {/* Changed to items-start */}
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" /> {/* Added mt-0.5 */}
                            <span>{description}</span>
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            onConfirm?.();
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default WarningPopup;