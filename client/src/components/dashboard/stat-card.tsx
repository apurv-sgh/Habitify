import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  color: "primary" | "success" | "warning" | "danger";
};

const colorMap = {
  primary: "bg-primary/10 text-primary",
  success: "bg-green-100 text-green-600",
  warning: "bg-orange-100 text-orange-600",
  danger: "bg-red-100 text-red-600",
};

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-semibold text-gray-800">{value}</p>
        </div>
        <div className={`${colorMap[color]} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
