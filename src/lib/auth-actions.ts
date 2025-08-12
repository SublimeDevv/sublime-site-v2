"use server";

import { signIn } from "@/auth";

export async function authenticate(formData: any) {
  try {
    await signIn("credentials", formData);
    return { success: true, message: "Inicio de sesión exitoso" };
  } catch (err: any) {
    if (err.type === "AuthError") {
      return {
        success: false,
        message: err.message,
      };
    }
    return {
      success: false,
      message: "Error en el inicio de sesión. Verifica tus credenciales.",
      error: err,
    };
  }
}
