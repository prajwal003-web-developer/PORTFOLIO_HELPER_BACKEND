import { Response } from 'express';

export const ThrowError = (res: Response, error: unknown) => {
  // Convert unknown to Error if needed
  const message =
    error instanceof Error ? error.message : 'Something went wrong';

  // Log full error internally for debugging
  console.error(error);

  // Send a safe response to the client
  return res.status(500).json({
    success: false,
    message,
  });
};
