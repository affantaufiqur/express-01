import { response as res } from "express";

export default function handleError(status: number, message: string) {
  res.json({ data: null, status, message });
  return;
}
