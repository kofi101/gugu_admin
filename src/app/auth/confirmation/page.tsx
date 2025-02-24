import ConfirmationPage from './Confirmation';
import { merchantUrl } from '@/config/base-url';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Confirmation'),
};

export type CompanyDetailsType = {
  companyDetailsId: number;
  callUseNowNumber: string;
  siteDisplayEmail: string;
  welcomeMessage: string;
  ourVision: string;
  ourMission: string;
};

export default async function ConfirmPage() {
  try {
    let companyDetails = await fetch(`${merchantUrl}/CompanyDetails`).then(
      (data) => data.json()
    );

    return <ConfirmationPage details={companyDetails || {}} />;
  } catch (error) {
    return <ConfirmationPage />;
  }
}
