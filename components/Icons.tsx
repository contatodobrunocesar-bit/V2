import React from 'react';

const IconBase: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        {props.children}
    </svg>
);

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M3 10.5v9.75a1.5 1.5 0 001.5 1.5h3.75a1.5 1.5 0 001.5-1.5V15a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v5.25a1.5 1.5 0 001.5 1.5h3.75a1.5 1.5 0 001.5-1.5V10.5" /></IconBase>
);

export const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></IconBase>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.485.4.665 1.08.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></IconBase>
);

export const FileTextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></IconBase>
);

export const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-2.438c.157-.149.222-.34.222-.529V15m-9.477-2.121a9.371 9.371 0 00-2.625.372M3 15.75V15m6-6.75v-1.5a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v1.5M9 15.75v-1.5a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v1.5m9-6.75V9A2.25 2.25 0 009 6.75H3.75A2.25 2.25 0 001.5 9v.75m9-6.75h1.5a2.25 2.25 0 012.25 2.25v1.5m-6.75-9a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25v1.5" /></IconBase>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></IconBase>
);

export const FilterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></IconBase>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></IconBase>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></IconBase>
);

export const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></IconBase>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></IconBase>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></IconBase>
);

export const LogOutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></IconBase>
);

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></IconBase>
);

export const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></IconBase>
);

export const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);

export const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.098a2.25 2.25 0 01-2.25 2.25h-13.5a2.25 2.25 0 01-2.25-2.25V14.15M16.5 18.75h-9" /><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9.75v3.375c0 .621-.504 1.125-1.125 1.125h-16.5c-.621 0-1.125-.504-1.125-1.125V9.75m18.75 0c0-.621-.504-1.125-1.125-1.125h-16.5c-.621 0-1.125.504-1.125 1.125m18.75 0v-2.625c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125v2.625m-12 0v-2.625c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125v2.625" /></IconBase>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></IconBase>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></IconBase>
);

export const ZapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></IconBase>
);

export const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.94.886M21.75 5.25L17.81 6.136" /></IconBase>
);

export const DollarSignIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.95-.715 2.707-.715 3.657 0l.879.659m0-2.215V4.5" /></IconBase>
);

export const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></IconBase>
);

export const FilePdfIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></IconBase>
);

export const FileWordIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m9.75 9l-3 3m0 0l-3-3m3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></IconBase>
);

export const FileImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></IconBase>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></IconBase>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 011.62-5.419L16.25 4.5l2.25 2.25L9.813 15.904z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.25 4.5l2.25 2.25M12 12l2.25 2.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h.008v.008H3.75V12zM6.375 14.625h.008v.008H6.375v-.008zM9 17.25h.008v.008H9v-.008zM11.625 19.875h.008v.008h-.008v-.008zM4.5 4.5h.008v.008H4.5V4.5zM7.125 7.125h.008v.008H7.125V7.125zM9.75 9.75h.008v.008H9.75V9.75z" /></IconBase>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></IconBase>
);

export const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></IconBase>
);

export const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></IconBase>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></IconBase>
);

export const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" /></IconBase>
);

export const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></IconBase>
);

export const ToggleLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5" transform="rotate(180 12 12)"/></IconBase>
);

export const ToggleRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5" /></IconBase>
);

export const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></IconBase>
);

export const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.162a2.25 2.25 0 00-2.246 2.033L3 20.25a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 20.25l-.912-14.467a2.25 2.25 0 00-2.246-2.033H15M12 3v12m-3-6l3 3 3-3" /></IconBase>
);

export const CloudSyncIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></IconBase>
);

export const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 100-2.186m0 2.186a2.25 2.25 0 100-2.186m0 0l-9.566-5.314" /></IconBase>
);