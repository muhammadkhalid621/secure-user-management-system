export const FormError = ({ message }: { message?: string | null }) =>
  message ? (
    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
  ) : null;

export const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-red-600">{message}</p> : null;

export const FormSuccess = ({ message }: { message?: string | null }) =>
  message ? (
    <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>
  ) : null;
