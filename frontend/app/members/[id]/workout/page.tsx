"use client";
import React, { useEffect } from "react";
import WorkoutForm from "@/app/components/workoutForm";
import { useProgramContext } from "@/app/hooks/useProgramContext";
import GetCookie from "@/app/utils/getCookie";

const WorkoutPage = ({ params }: any) => {
  const MemberId = params.id;

  const { programs, dispatch } = useProgramContext();
  useEffect(() => {
    const token = GetCookie("token") || "";
    const fetchPrograms = async () => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_FULL_DOMAIN +
          "/api/programs/" +
          MemberId,
        {
          headers: {
            authorization: token,
          },
        },
      );
      const json = await response.json();
      if (response.ok) {
        console.log(json);
        dispatch({ type: "SET_PROGRAM", payload: json.programs });
      }
    };
    fetchPrograms();
  }, []);

  console.log(params.id);
  return (
    <div className="w-full flex-1 p-3">
      <WorkoutForm user_id={MemberId} />
    </div>
  );
};

export default WorkoutPage;
