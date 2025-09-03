import { RegisterForm } from '@/components/register-form'
import { useState } from 'react'
import { useSetAtom } from 'jotai'
import axios from 'axios'
import { userInfoWithPersistenceAtom } from '@/atoms/user'
import { useNavigate } from 'react-router'

export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const setUser = useSetAtom(userInfoWithPersistenceAtom)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await axios.post('/api/users/', {
        name,
        phone,
        email,
        password,
      })
      const user = res.data

      setUser(user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Register failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm
          name={name}
          phone={phone}
          email={email}
          password={password}
          setName={setName}
          setPhone={setPhone}
          setEmail={setEmail}
          setPassword={setPassword}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
