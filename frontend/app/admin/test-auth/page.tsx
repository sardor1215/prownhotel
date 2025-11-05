'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [cookies, setCookies] = useState<string>('');
  const [localStorageData, setLocalStorageData] = useState<string>('');
  const [email, setEmail] = useState<string>('admin@showercabin.com');
  const [password, setPassword] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setAuthStatus('Checking authentication status...');
      
      // Check cookies
      const cookieString = document.cookie;
      setCookies(cookieString || 'No cookies found');

      // Check localStorage
      const adminUser = typeof window !== 'undefined' ? window.localStorage.getItem('adminUser') : null;
      setLocalStorageData(adminUser || 'No admin user found in localStorage');

      // Check if we have a token cookie
      const hasToken = cookieString.includes('token=');
      
      // Verify token with backend
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin-auth/verify`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (verifyResponse.ok) {
        const data = await verifyResponse.json();
        setApiResponse(data);
        setAuthStatus('✅ Authenticated with backend');
      } else {
        setAuthStatus('❌ Not authenticated with backend');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthStatus(`❌ Error checking auth status: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      setIsLoading(true);
      setAuthStatus('Attempting login...');
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const loginUrl = `${apiUrl}/api/admin-auth/login`;
      
      console.log('Attempting login to:', loginUrl);
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      const data = await response.json().catch(() => ({
        error: 'Invalid JSON response from server'
      }));
      
      console.log('Login response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      if (response.ok) {
        setAuthStatus('✅ Login successful');
        // Wait a moment for cookies to be set
        setTimeout(() => checkAuthStatus(), 500);
      } else {
        setAuthStatus(`❌ Login failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthStatus(`❌ Login error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogout = async () => {
    try {
      setIsLoading(true);
      setAuthStatus('Logging out...');
      
      const response = await fetch('/api/admin-auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setAuthStatus('✅ Logout successful');
        // Clear local storage
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('adminUser');
        }
        // Re-check auth status
        setTimeout(() => checkAuthStatus(), 500);
      } else {
        setAuthStatus('❌ Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      setAuthStatus(`❌ Logout error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const goToDashboard = () => {
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Authentication Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <p className="text-lg mb-4">{authStatus}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Cookies:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {cookies || 'No cookies found'}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">LocalStorage:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {localStorageData}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Login Form</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="admin@showercabin.com"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={testLogin}
              disabled={isLoading}
              className={`px-4 py-2 rounded text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? 'Processing...' : 'Test Login'}
            </button>
            <button
              onClick={testLogout}
              disabled={isLoading}
              className={`px-4 py-2 rounded text-white ${isLoading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isLoading ? 'Processing...' : 'Test Logout'}
            </button>
            <button
              onClick={checkAuthStatus}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
            >
              Refresh Status
            </button>
            <button
              onClick={goToDashboard}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400"
              disabled={isLoading}
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {apiResponse && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h3 className="font-medium mb-2">Response Status: {apiResponse.status} {apiResponse.statusText || ''}</h3>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(apiResponse.data || apiResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Test Login" to attempt login (you'll need to provide the correct password)</li>
            <li>Check if the token cookie is set</li>
            <li>Click "Go to Dashboard" to test if you can access the admin dashboard</li>
            <li>Click "Test Logout" to clear the authentication</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

