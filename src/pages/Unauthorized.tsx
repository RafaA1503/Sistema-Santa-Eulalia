import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/10 mb-6">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-8">
          No tienes permisos de administrador para acceder a esta sección. 
          Contacta al administrador del sistema si crees que esto es un error.
        </p>
        <Button asChild>
          <Link to="/login">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
