import React from "react";
import { motion } from "framer-motion";
import { Cloud, Server, Globe } from "lucide-react";

export interface BrandingPanelProps {
  features: Array<{ icon: React.ElementType; title: string; description: string }>;
  stats: Array<{ value: string; label: string }>;
  containerVariants: any;
  itemVariants: any;
  statsVariants: any;
}

/**
 * BrandingPanel - Marketing side panel for auth pages
 * Displays animated features, stats, and branding elements
 * Visible only on lg+ screens
 */
export const BrandingPanel: React.FC<BrandingPanelProps> = ({
  features,
  stats,
  containerVariants,
  itemVariants,
  statsVariants,
}) => {
  return (
    <motion.div
      className="hidden lg:flex lg:flex-1 lg:max-w-2xl"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
    >
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-12 h-full flex flex-col justify-center w-full">
        <motion.div className="max-w-md mx-auto" variants={containerVariants} initial="hidden" animate="visible">
          
          {/* Logo & Brand Header */}
          <motion.div className="mb-8" variants={itemVariants}>
            <motion.div
              className="w-12 h-12 bg-primary-foreground rounded-lg mb-4 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-8 h-8 bg-primary rounded-md flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
              >
                <Server className="w-4 h-4 text-primary-foreground" />
              </motion.div>
            </motion.div>
            <motion.h1
              className="text-3xl mb-2 font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Infraless
            </motion.h1>
            <motion.p
              className="text-primary-foreground/80 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              The modern cloud deployment platform for teams who want to ship faster and scale effortlessly.
            </motion.p>
          </motion.div>

          {/* Features Section */}
          <motion.div className="space-y-6 mb-8" variants={containerVariants}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-4"
                variants={itemVariants}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon className="w-6 h-6 text-primary-foreground/90" />
                </motion.div>
                <div>
                  <h3 className="mb-1 font-semibold">{feature.title}</h3>
                  <p className="text-primary-foreground/70 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-3 gap-6 mb-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.8,
                },
              },
            }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={statsVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="text-2xl mb-1 font-bold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2, delay: index * 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-primary-foreground/70 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            className="mt-8 pt-8 border-t border-primary-foreground/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            <p className="text-primary-foreground/60 text-xs mb-4">Trusted by developers worldwide</p>
            <motion.div
              className="flex justify-between items-center"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              {[Globe, Server, Cloud].map((Icon, index) => (
                <motion.div
                  key={index}
                  className="w-16 h-8 bg-primary-foreground/20 rounded flex items-center justify-center"
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-4 h-4 text-primary-foreground/40" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
