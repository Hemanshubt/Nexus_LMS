"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CertificatePage;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const api_1 = require("@/services/api");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function CertificatePage() {
    const { courseId } = (0, react_router_dom_1.useParams)();
    const [certificate, setCertificate] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        fetchCertificate();
    }, [courseId]);
    const fetchCertificate = async () => {
        try {
            const res = await api_1.api.get(`/certificates/${courseId}`);
            setCertificate(res.data.data.certificate);
        }
        catch (err) {
            console.error("Failed to fetch certificate", err);
            setError(err.response?.data?.message || "Failed to load certificate.");
        }
        finally {
            setIsLoading(false);
        }
    };
    if (isLoading)
        return <div className="flex justify-center p-20"><lucide_react_1.Loader2 className="animate-spin w-8 h-8"/></div>;
    if (error) {
        return (<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <p className="text-red-500 font-medium">{error}</p>
                <button_1.Button variant="outline" asChild>
                    <react_router_dom_1.Link to="/courses">Back to Courses</react_router_dom_1.Link>
                </button_1.Button>
            </div>);
    }
    if (!certificate)
        return null;
    return (<div className="container py-10 flex flex-col items-center">

            <div className="mb-6 flex gap-4 print:hidden">
                <button_1.Button variant="outline" onClick={() => window.print()}>
                    <lucide_react_1.Printer className="mr-2 h-4 w-4"/> Print / Save as PDF
                </button_1.Button>
                <button_1.Button variant="ghost" asChild>
                    <react_router_dom_1.Link to="/courses">Back to Dashboard</react_router_dom_1.Link>
                </button_1.Button>
            </div>

            {/* Certificate Frame */}
            <div className="bg-white text-black p-10 md:p-20 border-8 border-double border-yellow-600 rounded-lg shadow-2xl max-w-4xl w-full text-center space-y-8 aspect-[1.414/1] flex flex-col justify-center print:shadow-none print:border-4 print:w-full print:aspect-auto print:h-screen">

                <div className="space-y-2">
                    <h1 className="text-5xl font-serif font-bold text-gray-800 uppercase tracking-widest">Certificate</h1>
                    <p className="text-xl text-yellow-600 font-serif italic">of Completion</p>
                </div>

                <div className="space-y-4 py-8">
                    <p className="text-lg text-gray-600">This is to certify that</p>
                    <h2 className="text-4xl font-bold font-serif underline decoration-yellow-500/30 underline-offset-8">
                        {certificate.user.name}
                    </h2>
                    <p className="text-lg text-gray-600">has successfully completed the course</p>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {certificate.course.title}
                    </h3>
                </div>

                <div className="flex justify-between items-end pt-12 px-10">
                    <div className="text-center">
                        <div className="border-b-2 border-gray-400 pb-2 px-8 mb-2 min-w-[200px]">
                            {new Date(certificate.issuedAt).toLocaleDateString()}
                        </div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Date Issued</p>
                    </div>

                    <div className="text-center">
                        <div className="border-b-2 border-gray-400 pb-2 px-8 mb-2 min-w-[200px] font-signature text-2xl">
                            {certificate.course.instructor.name}
                        </div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Instructor</p>
                    </div>
                </div>

                <div className="text-xs text-gray-400 mt-auto pt-8">
                    Certificate ID: {certificate.id} <br />
                    Nexus LMS Verification
                </div>
            </div>
        </div>);
}
