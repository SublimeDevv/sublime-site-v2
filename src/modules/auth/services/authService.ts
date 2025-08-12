import { HttpClient } from "@/services/httpClient";
import { RegisterModel } from "../models/register";
import { ResponseHelper } from "@/interfaces/ResponseHelper";

const httpClient = new HttpClient();

async function register(firstName: string, lastName: string, email: string, password: string) {
  const response = await httpClient.post<ResponseHelper<RegisterModel>>(
    "/auth/register",
    { firstName, lastName, email, password }
  );
  return response;
}

export { register };
