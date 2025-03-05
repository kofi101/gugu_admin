import EditCompanyDetails from './edit-company-details';
export const CompanyDetails = ({ companyDetails }) => {
  return (
    <div className="w-full  rounded-lg border bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        Company Details
      </h2>

      {/* Grid Layout for Company Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <p className="leading-9 text-gray-700 ">
          <span className="font-bold">Call Us Now:</span>{' '}
          {companyDetails?.callUseNowNumber}
        </p>
        <p className="leading-9 text-gray-700">
          <span className="font-bold">Email:</span>{' '}
          {companyDetails?.siteDisplayEmail}
        </p>
        <p className="leading-9 text-gray-700 md:col-span-2">
          <span className="font-bold">Welcome Message:</span>{' '}
          {companyDetails?.welcomeMessage}
        </p>
        <p className="leading-9 text-gray-700">
          <span className="font-bold">Our Vision:</span>{' '}
          {companyDetails?.ourVision}
        </p>
        <p className="leading-9 text-gray-700">
          <span className="font-bold">Our Mission:</span>{' '}
          {companyDetails?.ourMission}
        </p>
      </div>

      {/* Edit Button Below */}
      <div className="mt-6 flex justify-end">
        <EditCompanyDetails companyDetails={companyDetails} />
      </div>
    </div>
  );
};
