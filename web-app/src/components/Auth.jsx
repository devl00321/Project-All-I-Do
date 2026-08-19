import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { signIn } = useAuth();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const res = await axios.post('http://localhost:5000/api/customer/login', { email, password });
        signIn(res.data.token, res.data.user);
      } else {
        const res = await axios.post('http://localhost:5000/api/customer/register', { name, email, password });
        signIn(res.data.token, res.data.user);
        alert('Registration successful!');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen" style={{ background: 'var(--bg)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="card w-full max-w-md p-8 shadow-md"
        style={{ maxWidth: '400px' }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--mintLight)' }}
          >
            <Lock className="w-8 h-8" style={{ color: 'var(--mint)' }} />
          </motion.div>
          <h2 className="text-2xl font-bold text-ink mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-muted">
            {isLogin ? 'Enter your details to access your account' : 'Sign up to get started with All-I-Do'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="relative">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="fi pl-4"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="fi pl-12"
              required
            />
          </div>
          
          <div className="relative mb-2">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="fi pl-12"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="pbtn lg w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Sign Up'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-sm font-semibold transition-colors duration-200 cursor-pointer"
            style={{ color: 'var(--mintDark)' }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
