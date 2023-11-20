import { notFound } from "next/navigation";

interface Params {
  id: any;
}
export const dynamicParams = true;

export async function generateStaticParams() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_FULL_DOMAIN}/api/users`,
    {
      next: {
        revalidate: 0,
      },
    },
  );

  const members = await res.json();

  return members.users.map((member: any) => ({
    ...member,
  }));
}

export default async function MemberDetails({ params }: { params: Params }) {
  const members = await generateStaticParams(); // Fetch all members

  const member = members.find((m: any) => m._id === params.id);

  if (!member) {
    notFound();
  }

  return (
    <main className=" h-screen">
      <nav>
        <h2 className=" mb-2 text-lg font-bold">Member Details</h2>
      </nav>
      <div className="ml-4">
        <h3 className="text-lg">
          {member.first_name + " " + member.last_name}
        </h3>
        <p>{member.gender}</p>
        <p>{member.dob}</p>
        <p>{member.email}</p>
        <p>{member.status}</p>
        <p>{member.role}</p>
      </div>
    </main>
  );
}