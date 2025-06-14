import supabase from "../../lib/supabaserole.js";

export const MemberlistUser = async () => {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("유저 가져오기 실패", error);
    return { data: [], error };
  }

  const userDataWithMetadata = data.users.map((user) => {
    return {
      ...user,
      user_metadata: user.user_metadata,
    };
  });

  return { data: userDataWithMetadata, error: null };
};
