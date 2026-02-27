import { PersonInfoCard } from "./parent-info";
import { Heart, User, Phone, MapPin } from "lucide-react";

interface Props {
  guardian: {
    id: string;
    name: string;
    img: string;
    phone: string;
    occupation: string;
    address: string;
    relationship: string;
    studentId: string;
  };
}

const GuardianInfo = ({ guardian }: Props) => {
  return (
    <PersonInfoCard
      title="Guardian"
      icon={<Heart className="w-3.5 h-3.5" />}
      img={guardian.img}
      fields={[
        {
          label: "Full Name",
          value: guardian.name,
          icon: <User className="w-3 h-3" />,
        },
        {
          label: "Phone",
          value: guardian.phone,
          icon: <Phone className="w-3 h-3" />,
        },
        { label: "Occupation", value: guardian.occupation },
        { label: "Relationship", value: guardian.relationship },
        {
          label: "Address",
          value: guardian.address,
          icon: <MapPin className="w-3 h-3" />,
        },
      ]}
    />
  );
};
export default GuardianInfo;
