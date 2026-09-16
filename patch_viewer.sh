for file in src/components/AMVDocumentViewer.tsx src/components/RSAMVDocumentViewer.tsx src/components/DissolutionDocumentViewer.tsx; do
  sed -i '/Simple Format (No Color)/a \
            </button>\
            <button\
              type="button"\
              onClick={() => onThemeChange('\''westcoast'\'')}\
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${\
                theme === '\''westcoast'\''\
                  ? '\''bg-green-700 text-white shadow-xs'\''\
                  : '\''text-zinc-600 hover:text-zinc-900'\''\
              }`}\
            >\
              <span className="w-2 h-2 rounded-full bg-green-400"></span>\
              Westcoast Format' $file
done
