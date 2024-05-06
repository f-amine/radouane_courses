"use client"

import { useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useEffect, useRef, useState } from "react"
import SessionData from "./session-data"
import CustomLink from "./custom-link"
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();
const UpdateForm = () => {
  const { data: session, update } = useSession()
  const [name, setName] = useState(`New ${session?.user?.name}` ?? "")

  if (!session?.user) return null
  return (
    <>
      <h2 className="text-xl font-bold">
        Updating the session
      </h2>
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
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchCoursesCalled = useRef(false);
  const [selectedPdf, setSelectedPdf] = useState<any>(null);

  
  const fetchCourses = async (cursor: string | null = null) => {
    setLoading(true);
    let url = `/api/course?pageSize=2`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    try {
      const response = await fetch(url);
      const data1 = await response.json();
      console.log(data1);
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
      fetchCoursesCalled.current = true;
    }
  }, []);
  const handleDownload = (pdf:any) => {
    const base64String = Buffer.from(pdf.content.data).toString('base64');
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${base64String}`;
    link.download = `${pdf.title}.pdf`;
    link.click();
  };
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Client Side Rendering</h1>
      <div>
      <h1>Courses</h1>
      {loading && <p>Loading...</p>}
      <ul>
      {courses.map(course => (
        <li key={course.id}>
          {course.name}
          {course.PDFs.length > 0 && (
            <button onClick={() => setSelectedPdf(course.PDFs[0].content)}>
              View PDF
            </button>
          )}
        </li>
      ))}
      {selectedPdf && (
        <PdfComp key={selectedPdf.id} pdfFile={selectedPdf}/>
      )}
    </ul>
      {nextCursor && (
        <button onClick={() => fetchCourses(nextCursor)} disabled={loading}>
          Load More
        </button>
      )}
      {/* <PdfUpload /> */}
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
  videos: any[]; 
  PDFs: any[]; 
}



export  function PdfUpload() {
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file || !title || !courseId) {
      alert('Please fill all fields');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (!base64String) {
        alert('Failed to convert file to base64');
        return;
      }

      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64String,
          title,
          courseId,
        }),
      });

      if (response.ok) {
        alert('PDF created successfully');
      } else {
        alert('Failed to create PDF');
      }
    };

    reader.readAsDataURL(file);
  };
  const handleDownload = async () => {
    const response = await fetch('/api/pdf');
    if (!response.ok) {
      alert('Failed to fetch PDFs');
      return;
    }

    const { pdfs } = await response.json();
    pdfs.forEach((pdf:any, index:any) => {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdf.content}`;
      link.download = `pdf${index + 1}.pdf`;
      link.click();
    });
  };

  return (
    <div>
    <form onSubmit={handleSubmit}>
      <label>
        Title:
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Course ID:
        <input type="text" value={courseId} onChange={(e) => setCourseId(e.target.value)} required />
      </label>
      <label>
        PDF:
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
      </label>
      <button type="submit">Create PDF</button>
    </form>
    <button className="bg-slate-500 " onClick={handleDownload}>Download All PDFs</button>
</div>  
  );
}



function PdfComp(props:any) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }
  return (
    <div className="pdf-div">
      <p>
        Page {pageNumber} of {numPages}
      </p>
      <Document file={props.pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.apply(null, Array(numPages))
          .map((x, i) => i + 1)
          .map((page) => {
            return (
              <Page
                key={page}
                pageNumber={page}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            );
          })}
      </Document>
    </div>
  );
}
// change ui of loading here : 
{/* <Document 
  file={props.pdfFile} 
  onLoadSuccess={onDocumentLoadSuccess}
  loading={<div>Your custom loading UI here</div>}
></Document> */}

// call this to sign in to google : http://localhost:3000/api/auth/signin/google