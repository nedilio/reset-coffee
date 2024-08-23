interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  coffees: number;
  role: "admin" | "user";
}
