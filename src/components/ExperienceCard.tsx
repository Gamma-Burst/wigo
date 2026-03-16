import Image from 'next/image';

interface ExperienceCardProps {
    title: string;
    location: string;
    price: string;
    imageUrl: string;
}

export default function ExperienceCard({ title, location, price, imageUrl }: ExperienceCardProps) {
    return (
        <div className="group glass rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/20 cursor-pointer">
            <div className="relative h-64 w-full overflow-hidden">
                {/* Placeholder gradient if no image */}
                <div className="absolute inset-0 bg-gradient-to-br from-forest/40 to-forest/80 z-0"></div>
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110 z-10"
                />
                <div className="absolute top-4 right-4 z-20 glass p-2 rounded-full text-foreground hover:text-accent transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-foreground line-clamp-1">{title}</h3>
                </div>
                <p className="text-foreground/70 mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {location}
                </p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-foreground/10">
                    <span className="text-lg font-semibold text-foreground">
                        {price}
                    </span>
                    <span className="text-sm font-medium text-accent hover:underline flex items-center">
                        Réserver
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                </div>
            </div>
        </div>
    );
}
