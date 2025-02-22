import { create } from "zustand";

type AlertStoreType = {
  isVisible: boolean;
  message: string;
  type: "SUCCESS" | "ERROR" | "NEUTRAL";
  showAlert: ({
    message,
    type,
  }: {
    message: string;
    type?: "SUCCESS" | "ERROR" | "NEUTRAL";
  }) => void;
  hideAlert: () => void;
};

export const useAlertStore = create<AlertStoreType>((set) => ({
  isVisible: false,
  message: "",
  type: "NEUTRAL",
  showAlert: ({ message, type = "NEUTRAL" }) =>
    set({ isVisible: true, message, type }),
  hideAlert: () => set({ isVisible: false, message: "", type: "NEUTRAL" }),
}));
