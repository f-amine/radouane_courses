"use client"

import { useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useEffect, useRef, useState } from "react"
import SessionData from "./session-data"
import CustomLink from "./custom-link"

const UpdateForm = () => {
  const { data: session, update } = useSession()
  const [name, setName] = useState(`New ${session?.user?.name}` ?? "")

  if (!session?.user) return null
  return (
    <>
      <h2 className="text-xl font-bold">Updating the session</h2>
      <form
        onSubmit={async () => {
          if (session) {
            const newSession = await update({
              ...session,
              user: { ...session.user, name },
            })
            console.log({ newSession })
          }
        }}
        className="flex items-center space-x-2 w-full max-w-sm"
      >
        <Input
          type="text"
          placeholder="New name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
        />
        <Button type="submit">Update</Button>
      </form>
    </>
  )
}

export default function ClientExample() {
  const { data: session, status } = useSession()
  const [courses, setCourses] = useState<Course[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchCoursesCalled = useRef(false);

  const fetchCourses = async (cursor: string | null = null) => {
    setLoading(true);
    let url = `${process.env.NEXTAUTH_URL}/api/course?pageSize=2`; // Adjust with your actual API endpoint
    if (cursor) {
      url += `&cursor=${cursor}`;
    }

    try {
      const response = await fetch(url);
      const data1 = await response.json();
      setCourses(prevCourses => [...prevCourses, ...data1.courses]);
      setNextCursor(data1.nextCursor);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!fetchCoursesCalled.current) {
      fetchCourses();
      fetchCoursesCalled.current = true; // Mark as called
    }
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Client Side Rendering</h1>
      <div>
      <h1>Courses</h1>
      {loading && <p>Loading...</p>}
      <ul>
        {courses.map(course => (
          <li key={course.id}>{course.name}</li>
        ))}
      </ul>
      {nextCursor && (
        <button onClick={() => fetchCourses(nextCursor)} disabled={loading}>
          Load More
        </button>
      )}
    </div>
      <p>
        This page fetches session data client side using the{" "}
        <CustomLink href="https://nextjs.authjs.dev/react#usesession">
          <code>useSession</code>
        </CustomLink>{" "}
        React Hook.
      </p>
      <p>
        It needs the{" "}
        <CustomLink href="https://react.dev/reference/rsc/use-client">
          <code>'use client'</code>
        </CustomLink>{" "}
        directive at the top of the file to enable client side rendering, and
        the{" "}
        <CustomLink href="https://nextjs.authjs.dev/react#sessionprovider">
          <code>SessionProvider</code>
        </CustomLink>{" "}
        component in{" "}
        <strong>
          <code>client-example/page.tsx</code>
        </strong>{" "}
        to provide the session data.
      </p>

      {status === "loading" ? (
        <div>Loading...</div>
      ) : (
        <SessionData session={session} />
      )}
      <UpdateForm />
    </div>
  )
}


interface Course {
  id: string;
  name: string;
  description: string;
  is_sup: boolean;
  level: string;
  language: string;
  is_premium: boolean;
  date_created: string;
  date_updated: string;
  videos: any[]; // Specify a more detailed type if you know the structure of the objects in the array
  PDFs: any[]; // Specify a more detailed type if you know the structure of the objects in the array
}