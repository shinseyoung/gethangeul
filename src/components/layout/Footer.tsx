import { useTranslation } from '../../hooks/useTranslation';

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="relative z-10 w-full shrink-0 border-t border-rule bg-ground">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-6 py-5 lg:w-[1024px] lg:px-4 xl:w-[1200px]">
        <span className="text-[10.5px] tracking-wide text-ink-4">{t('footer.copyright')}</span>
        <span className="eyebrow text-[8px] tracking-[0.26em] text-ink-4">GETHANGEUL</span>
      </div>
    </footer>
  );
};
