"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PhotoUpload from "../components/PhotoUpload";
import { calculateAge } from "../utils/age";
import { capitalizeFirstLetter } from "../utils/capitalize";
import Notify from "../components/Notify";
import GetCookie from "../utils/getCookie";
const Token = GetCookie("token") || "";
import Loading from "../components/LoadingPage";

export default function Account() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [first_name, setFirstName] = useState<string>("");
  const [last_name, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [accessCode, setAccessCode] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [allergy, setAllergy] = useState<string>("");
  const [vegan, setVegan] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const { data: session } = useSession();

  useEffect(() => {
    const getInfo = async () => {
      try {
        if (session?.user) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_FULL_DOMAIN}/api/user`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                authorization: Token,
              },
            },
          );
          if (!res.ok) {
            throw new Error("Failed to fetch members");
          }
          const fetchedMembers = await res.json();
          console.log(fetchedMembers);
          setFirstName(fetchedMembers.user.first_name);
          setLastName(fetchedMembers.user.last_name);
          setAccessCode(fetchedMembers.user.access_code);
          setEmail(fetchedMembers.user.email);
          setGender(fetchedMembers.user.gender);
          setAge(fetchedMembers.user.dob);
          setStatus(fetchedMembers.user.status);
          setRole(fetchedMembers.user.role);
          setGoal(fetchedMembers.user.goal ? fetchedMembers.user.goal : "");
          setHeight(
            fetchedMembers.user.height
              ? String(fetchedMembers.user.height)
              : "",
          );
          setWeight(
            fetchedMembers.user.weight
              ? String(fetchedMembers.user.weight)
              : "",
          );
          setAllergy(
            fetchedMembers.user.allergy ? fetchedMembers.user.allergy : "",
          );
          setVegan(
            fetchedMembers.user.vegan
              ? String(fetchedMembers.user.vegan)
              : "false",
          );
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getInfo();
  }, [session]);

  function handleChange(event: any) {
    const { name, value } = event.target;

    switch (name) {
      case "email":
        setEmail(value);
        break;
      case "height":
        setHeight(value);
        break;
      case "weight":
        setWeight(value);
        break;
      case "vegan":
        setVegan(value);
        break;
      case "goal":
        setGoal(value);
        break;
      case "allergy":
        setAllergy(value);
        break;
    }
  }

  const handleSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const dataToSubmit = { email, height, weight, vegan, goal, allergy };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_FULL_DOMAIN}/api/user/`,
        {
          method: "PATCH",
          body: JSON.stringify(dataToSubmit),
          headers: {
            "Content-Type": "application/json",
            authorization: Token,
          },
        },
      );
      const data = await response.json();
      if (!response.ok) return setError(data.message);
      setSuccess("Details updated successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (isLoading) return <Loading />;
  else
    return (
      <div className="w-full flex-1 p-3">
        <h1 className="mb-3 text-3xl font-semibold">Account</h1>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <PhotoUpload
            firstName={first_name}
            lastName={last_name}
            gender={gender}
          />

          <form
            onSubmit={handleSubmission}
            autoComplete="off"
            noValidate
            className="mb-4 grow bg-white px-8 pb-8 pt-6"
          >
            <h1 className="mb-1 mt-10 text-xl font-bold">Profile</h1>
            <p className="mb-4 text-xs font-semibold text-gray-500">
              The information can be edited
            </p>
            <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <NonModifiableField
                type="text"
                label="First Name"
                id="first_name"
                name="first_name"
                value={capitalizeFirstLetter(first_name)}
              />
              <NonModifiableField
                type="text"
                label="Last Name"
                id="last_name"
                name="last_name"
                value={capitalizeFirstLetter(last_name)}
              />
              <InputField
                type="email"
                label="Email"
                id="email"
                name="email"
                value={email}
                edit={true}
                handleChange={handleChange}
              />
              <NonModifiableField
                type="text"
                label="Access Code"
                id="access_code"
                name="access_code"
                value={accessCode}
              />
              <NonModifiableField
                type="text"
                label="Age"
                id="age"
                name="age"
                value={age}
                isAge={true}
              />
              <NonModifiableField
                type="text"
                label="Gender"
                id="gender"
                name="gender"
                value={capitalizeFirstLetter(gender)}
              />
              <NonModifiableField
                type="text"
                label="Status"
                id="status"
                name="status"
                value={capitalizeFirstLetter(status)}
              />
              <NonModifiableField
                type="text"
                label="Role"
                id="role"
                name="role"
                value={capitalizeFirstLetter(role)}
              />
              <InputField
                type="number"
                label="Height (cm)"
                id="height"
                name="height"
                value={height}
                edit={true}
                handleChange={handleChange}
              />
              <InputField
                type="number"
                label="Weight (kg)"
                id="weight"
                name="weight"
                value={weight}
                edit={true}
                handleChange={handleChange}
              />
              <div className="mt-5 flex h-14 items-center justify-between rounded-lg border border-gray-500 px-3 py-2">
                <p className="font-semibold text-gray-700">Vegan?</p>
                <div>
                  <div className="mb-4 flex justify-between gap-3">
                    <label
                      className="block text-xs font-bold text-gray-400"
                      htmlFor="vegan-yes"
                    >
                      Yes
                    </label>
                    <input
                      type="radio"
                      id="vegan-yes"
                      name="vegan"
                      value="true"
                      onChange={handleChange}
                      checked={vegan === "true"}
                    />
                  </div>
                  <div className="flex justify-between gap-3">
                    <label
                      className="block text-xs font-bold text-gray-400"
                      htmlFor="vegan-no"
                    >
                      No
                    </label>
                    <input
                      type="radio"
                      id="vegan-no"
                      name="vegan"
                      value="false"
                      onChange={handleChange}
                      checked={vegan === "false"}
                    />
                  </div>
                </div>
              </div>
              <InputField
                type="text"
                label="Goal"
                id="goal"
                name="goal"
                value={goal}
                edit={true}
                handleChange={handleChange}
                textarea={true}
              />
              <InputField
                type="text"
                label="Allergy"
                id="allergy"
                name="allergy"
                value={allergy}
                edit={true}
                handleChange={handleChange}
                textarea={true}
              />
            </div>
            {error ? <Notify message={error} /> : null}
            {success ? <Notify message={success} type="success" /> : null}
            <div className="flex justify-end">
              <button
                type="submit"
                className="mt-5 rounded-lg bg-blue-500 px-3 py-2 font-bold text-white hover:bg-blue-700"
              >
                Save details
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}
//modifiable input field
const InputField = ({
  label,
  id,
  name,
  type,
  value,
  handleChange,
  edit = false,
  isAge = false,
  textarea = false,
}: {
  label: string;
  id: string;
  name: string;
  type: string;
  value: string;
  handleChange?: any;
  edit?: boolean;
  isAge?: boolean;
  textarea?: boolean;
}) => {
  return (
    <div>
      <div className="mb-1 text-end">
        <label className="block text-xs font-bold text-gray-400" htmlFor={id}>
          {label}
        </label>
      </div>
      {textarea ? (
        <textarea
          className="min-h-14 w-full appearance-none rounded-lg border  px-3 py-2 font-medium leading-tight text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          id={id}
          name={name}
          value={isAge ? calculateAge(value) : value}
          onChange={handleChange}
          disabled={!edit}
        />
      ) : (
        <input
          className="h-14 w-full appearance-none rounded-lg border  px-3 py-2 font-medium leading-tight text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          type={type}
          id={id}
          name={name}
          value={isAge ? calculateAge(value) : value}
          onChange={handleChange}
          disabled={!edit}
        />
      )}
    </div>
  );
};
//non-modifiable input field
const NonModifiableField = ({
  label,
  id,
  name,
  type,
  value,
  handleChange,
  edit = false,
  isAge = false,
  textarea = false,
}: {
  label: string;
  id: string;
  name: string;
  type: string;
  value: string;
  handleChange?: any;
  edit?: boolean;
  isAge?: boolean;
  textarea?: boolean;
}) => {
  return (
    <div>
      <div className="mb-1 text-end">
        <label className="block text-xs font-bold text-gray-400" htmlFor={id}>
          {label}
        </label>
      </div>
      {textarea ? (
        <textarea
          className="min-h-14 w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 font-medium leading-tight text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          id={id}
          name={name}
          value={isAge ? calculateAge(value) : value}
          onChange={handleChange}
          disabled={!edit}
        />
      ) : (
        <input
          className="h-14 w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 font-medium leading-tight text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          type={type}
          id={id}
          name={name}
          value={isAge ? calculateAge(value) : value}
          onChange={handleChange}
          disabled={!edit}
        />
      )}
    </div>
  );
};
