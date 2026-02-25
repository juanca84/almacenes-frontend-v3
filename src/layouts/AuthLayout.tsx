import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: 'hsl(220, 20%, 96%)',
        backgroundImage: 'radial-gradient(hsl(220, 30%, 78%) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <Outlet />
    </div>
  )
}
