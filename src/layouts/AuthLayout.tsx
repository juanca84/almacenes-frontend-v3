import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Outlet />
    </div>
  )
}
