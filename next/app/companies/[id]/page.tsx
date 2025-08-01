import CompanyDetailsPage from "@/templates/Companies/CompanyDetailsPage";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page({ params }: Props) {
    const { id } = await params;
    return <CompanyDetailsPage companyId={id} />;
} 