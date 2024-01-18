import { Response } from "express";
export default function handleError(res: Response, status: number, message: string) {
  res.json({ data: null, status, message });
  return;
}
