import supertokens from 'supertokens-node';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import type { IdentityFacade } from '../modules/identity';
import type { AppConfig } from './config';
import { normalizeFullName } from '../modules/identity/application/full-name';

export const initializeSuperTokens = (config: AppConfig, identity: IdentityFacade): void => {
  supertokens.init({
    framework: 'express',
    supertokens: {
      connectionURI: config.SUPERTOKENS_CONNECTION_URI,
      apiKey: config.SUPERTOKENS_API_KEY,
    },
    appInfo: {
      appName: 'Starter Project',
      apiDomain: config.API_DOMAIN,
      websiteDomain: config.WEBSITE_DOMAIN,
      apiBasePath: '/auth',
      websiteBasePath: '/auth',
    },
    recipeList: [
      EmailPassword.init({
        signUpFeature: {
          formFields: [
            {
              id: 'fullName',
              validate: async (value) => {
                try {
                  normalizeFullName(String(value));
                  return undefined;
                } catch {
                  return 'Enter a full name using 2–100 valid characters';
                }
              },
            },
          ],
        },
        override: {
          apis: (original) => ({
            ...original,
            signUpPOST: async (input) => {
              if (!original.signUpPOST) throw new Error('EmailPassword sign-up API is unavailable');
              const response = await original.signUpPOST(input);
              if (response.status !== 'OK') return response;
              const fullName = input.formFields.find((field) => field.id === 'fullName')?.value;
              try {
                await identity.createProfile(
                  response.user.id,
                  normalizeFullName(String(fullName ?? '')),
                );
                return response;
              } catch (error) {
                await supertokens.deleteUser(response.user.id);
                console.error(
                  JSON.stringify({
                    level: 'error',
                    event: 'signup_profile_failed',
                    requestId: input.userContext.requestId,
                    error: error instanceof Error ? error.name : 'unknown',
                  }),
                );
                return {
                  status: 'GENERAL_ERROR',
                  message: 'Could not complete sign up. Please try again.',
                };
              }
            },
          }),
        },
      }),
      Session.init({ cookieSecure: config.NODE_ENV === 'production' }),
    ],
  });
  void identity;
};
