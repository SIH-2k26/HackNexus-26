import { motion } from 'framer-motion';
import { Database } from 'lucide-react';

export function TrainingAnimation() {
  return (
    <div className="flex items-center justify-center gap-6 py-8">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.3, scale: 0.95 }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-12 h-12 rounded-lg bg-primary/20 border-2 border-primary flex items-center justify-center">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs font-mono text-muted-foreground">Bank_{i}</span>
        </motion.div>
      ))}
    </div>
  );
}
