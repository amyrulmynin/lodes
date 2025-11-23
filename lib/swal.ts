import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Common styling to match the app's glassmorphism/dark theme
const commonConfig = {
    background: 'rgba(30, 30, 40, 0.95)',
    color: '#fff',
    confirmButtonColor: '#8b5cf6', // Primary purple
    cancelButtonColor: '#64748b', // Secondary gray
    backdrop: `
        rgba(0,0,0,0.4)
        left top
        no-repeat
    `,
    customClass: {
        popup: 'glass-card',
        title: 'gradient-text',
    }
};

export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    return MySwal.fire({
        ...commonConfig,
        title,
        text,
        icon,
    });
};

export const showConfirm = async (title: string, text: string, confirmButtonText = 'Yes', cancelButtonText = 'Cancel') => {
    const result = await MySwal.fire({
        ...commonConfig,
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true
    });
    return result.isConfirmed;
};

export const showToast = (title: string, icon: 'success' | 'error' = 'success') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
        background: 'rgba(30, 30, 40, 0.9)',
        color: '#fff',
    });

    Toast.fire({
        icon,
        title
    });
};
