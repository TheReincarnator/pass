import RegisterForm from '../components/RegisterForm'
import LoginForm from '@/components/LoginForm'

export default function Home() {
  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title">Einloggen</h1>
      </header>

      <div className="page-content">
        <LoginForm />

        <h2>Registrieren</h2>
        <p>Wenn du noch keinen Pass-Safe hast, kannst du hier einen anlegen.</p>
        <RegisterForm />
      </div>
    </article>
  )
}
