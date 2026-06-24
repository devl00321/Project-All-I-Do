import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('Check your email for the login link!');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>{isLogin ? 'Log In' : 'Sign Up'}</h2>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>
      <button 
        onClick={() => setIsLogin(!isLogin)} 
        style={{ marginTop: '10px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
      >
        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
      </button>
    </div>
  );
}
