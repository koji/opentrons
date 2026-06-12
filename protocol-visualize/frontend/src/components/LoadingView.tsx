export function LoadingView({ label }: { label: string }): JSX.Element {
  return (
    <div className="panel loading-view">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  )
}
