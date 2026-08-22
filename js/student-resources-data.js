// Add real files to a semester's resources array as they become available.
export const resourceCatalog = [
  {
    id: "bca",
    label: "BCA",
    semesters: [1, 2, 3, 4, 5, 6].map((number) => ({
      id: String(number),
      label: `Semester ${number}`,
      resources: [
        ...(number === 5
          ? [
              {
                title: "BCA Semester 5 Syllabus",
                subject: "BCA",
                description:
                  "GNDU official syllabus for the 2025-2026 academic session.",
                category: "Syllabus",
                format: "PDF",
                url: "https://collegeadmissions.gndu.ac.in/Syllabus/2025-2026/1005/B/P/2025-20261005BP12524.pdf",
              },
            ]
          : []),
        {
          title: `BCA Semester ${number} Previous Year Questions`,
          subject: "BCA",
          description: `Previous-year question papers for BCA Semester ${number}.`,
          category: "Previous Year Papers",
          format: "Web page",
          url: `https://www.gnduonline.com/bca.html#${number}s`,
        },
      ],
    })),
  },
  {
    id: "bsc",
    label: "B.Sc (PCM)",
    semesters: [1, 2, 3, 4, 5, 6].map((number) => ({
      id: String(number),
      label: `Semester ${number}`,
      resources: [
        {
          title: `B.Sc Semester ${number} Previous Year Questions`,
          subject: "B.Sc",
          description: `Previous-year question papers for B.Sc Semester ${number}.`,
          category: "Previous Year Papers",
          format: "Web page",
          url: `https://www.gnduonline.com/bsc.html#${number}s`,
        },
      ],
    })),
  },
  {
    id: "bsc-it",
    label: "B.Sc IT",
    semesters: [1, 2, 3, 4, 5, 6].map((number) => ({
      id: String(number),
      label: `Semester ${number}`,
      resources:
        number === 5
          ? [
              {
                title: "B.Sc IT Semester 5 Syllabus",
                subject: "B.Sc IT",
                description: "Official semester syllabus document.",
                category: "Syllabus",
                format: "PDF",
                url: "../docs/bsc_it_sly.pdf",
                download: true,
              },
            ]
          : [],
    })),
  },
  {
    id: "bcom",
    label: "B.Com",
    semesters: [1, 2, 3, 4, 5, 6].map((number) => ({
      id: String(number),
      label: `Semester ${number}`,
      resources: [
        {
          title: `B.Com Semester ${number} Previous Year Questions`,
          subject: "B.Com",
          description: `Previous-year question papers for B.Com Semester ${number}.`,
          category: "Previous Year Papers",
          format: "Web page",
          url: `https://www.gnduonline.com/bcom.html#${number}s`,
        },
      ],
    })),
  },
  {
    id: "msc",
    label: "M.Sc",
    semesters: [1, 2, 3, 4].map((number) => ({
      id: String(number),
      label: `Semester ${number}`,
      resources: [
        {
          title: `M.Sc Semester ${number} Previous Year Questions`,
          subject: "M.Sc",
          description: `Previous-year question papers for M.Sc Semester ${number}.`,
          category: "Previous Year Papers",
          format: "Web page",
          url: `https://www.gnduonline.com/msc.html#${number}s`,
        },
      ],
    })),
  },
  {
    id: "mcom",
    label: "M.Com",
    semesters: [1, 2, 3, 4].map((number) => ({
      id: String(number),
      label: `Semester ${number}`,
      resources: [
        {
          title: `M.Com Semester ${number} Previous Year Questions`,
          subject: "M.Com",
          description: `Previous-year question papers for M.Com Semester ${number}.`,
          category: "Previous Year Papers",
          format: "Web page",
          url: `https://www.gnduonline.com/mcom.html#${number}s`,
        },
      ],
    })),
  },
  {
    id: "ba",
    label: "B.A (Honours)",
    semesters: [1, 2, 3, 4, 5, 6].map((number) => ({
      id: String(number),
      label: `Semester ${number}`,
      resources: [
        {
          title: `B.A Semester ${number} Previous Year Questions`,
          subject: "B.A (Honours)",
          description: `Previous-year question papers for B.A Semester ${number}.`,
          category: "Previous Year Papers",
          format: "Web page",
          url: `https://www.gnduonline.com/ba.html#${number}s`,
        },
      ],
    })),
  },
];
