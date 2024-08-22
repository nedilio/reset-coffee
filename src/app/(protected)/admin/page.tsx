import {
  IconCoffeeOff,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";

export default async function AdminPage() {
  return (
    <div>
      <h2>Admin Page</h2>
      <p>Admins only</p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Coffes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Link href={`/card/nelson`}>Nelson</Link>
            </td>
            <td>test@email.com</td>
            <td>3</td>
            <td>
              <div className="flex gap-x-4 px-2">
                <button className="p-2 border rounded-md bg-yellow-600">
                  <IconEdit stroke={2} />
                </button>
                <button className="p-2 border rounded-md bg-red-700">
                  <IconTrash />
                </button>
                <button className="flex p-2 border rounded-md bg-blue-800">
                  <IconPlus stroke={2} />
                  <IconCoffeeOff />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
