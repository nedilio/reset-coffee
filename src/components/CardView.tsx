import posthog from "posthog-js";

const CardView = ({ email }: { email: string }) => {
  posthog.people.set({ email });
  posthog.capture("card_viewed", { email, $pathname: "/card" });
  return null;
};

export default CardView;
