export function Fallback({ error }: { error: Error }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div role="alert">
        <p>에러가 발생했어요:</p>
        <pre style={{ color: "red" }}>{error.message}</pre>
      </div>
    </div>
  );
}
