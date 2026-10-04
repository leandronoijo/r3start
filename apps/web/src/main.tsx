import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import SuperTokens, { SuperTokensWrapper } from 'supertokens-auth-react';
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword';
import { EmailPasswordPreBuiltUI } from 'supertokens-auth-react/recipe/emailpassword/prebuiltui';
import Session from 'supertokens-auth-react/recipe/session';
import { canHandleRoute, getRoutingComponent } from 'supertokens-auth-react/ui';
import './styles/theme.css';

type Greeting = Readonly<{ message: string }>;
type PersonalGreeting = Readonly<Greeting & { fullName: string }>;
const authRecipes = [EmailPasswordPreBuiltUI];
SuperTokens.init({
  appInfo: {
    appName: 'Starter Project',
    apiDomain: window.location.origin,
    websiteDomain: window.location.origin,
    apiBasePath: '/auth',
    websiteBasePath: '/auth',
  },
  recipeList: [
    EmailPassword.init({
      signInAndUpFeature: {
        signUpForm: {
          formFields: [{ id: 'fullName', label: 'Full name', placeholder: 'Ada Lovelace' }],
        },
      },
    }),
    Session.init(),
  ],
});
function App() {
  const [publicGreeting, setPublicGreeting] = useState<Greeting | null>(null);
  const [personalGreeting, setPersonalGreeting] = useState<PersonalGreeting | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void fetch('/api/hello')
      .then(async (response) => {
        if (!response.ok) throw new Error('Greeting unavailable');
        return response.json() as Promise<Greeting>;
      })
      .then(setPublicGreeting)
      .catch(() => setError('The greeting is temporarily unavailable.'));
  }, []);
  const loadPersonal = async () => {
    const response = await fetch('/api/hello/personal', { credentials: 'include' });
    if (response.status === 401) {
      window.location.assign('/auth');
      return;
    }
    if (!response.ok) {
      setError('Could not load your greeting.');
      return;
    }
    setPersonalGreeting((await response.json()) as PersonalGreeting);
  };
  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <section className="rounded-card bg-white p-10 shadow-card">
        <p className="text-sm font-semibold text-accent">Starter Project</p>
        <h1 className="mt-3 text-4xl font-bold">
          {personalGreeting ? `Hello ${personalGreeting.fullName}` : 'Welcome'}
        </h1>
        <p className="mt-4 text-lg">
          {personalGreeting?.message ?? publicGreeting?.message ?? 'Loading greeting…'}
        </p>
        {error && <p className="mt-4 text-red-700">{error}</p>}
        <button
          className="mt-8 rounded-lg bg-accent px-4 py-2 font-semibold text-white"
          onClick={() => void loadPersonal()}
        >
          {personalGreeting ? 'Refresh your greeting' : 'Sign in or sign up'}
        </button>
      </section>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SuperTokensWrapper>
      {canHandleRoute(authRecipes) ? getRoutingComponent(authRecipes) : <App />}
    </SuperTokensWrapper>
  </React.StrictMode>,
);
