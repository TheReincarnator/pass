import RegisterForm from "../components/RegisterForm"
import LoginForm from "@/components/LoginForm"

export default function Home() {
  return (
    <article className="page type-page hentry">
      <header className="page-header">
        <h1 className="page-title">Login</h1>
      </header>

      <div className="page-content">
        <LoginForm />

        <h2>Registrieren</h2>
        <p>Oder möchtest du dich registrieren?</p>
        <RegisterForm />
      </div>
    </article>
  )
}
