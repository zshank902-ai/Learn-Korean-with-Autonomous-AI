from datetime import datetime, timedelta, timezone


class SRSEngine:
    @staticmethod
    def calculate_next_review(
        quality: int, ease_factor: float, interval: int, repetitions: int
    ):
        """
        Implementation of the SM-2 Spaced Repetition Algorithm.

        quality (q): 0-5 response quality (0=complete blackout, 5=perfect recall)
        ease_factor (EF): Multiplier for the interval
        interval (I): Days until next review
        repetitions (n): Number of consecutive successful recalls
        """

        if quality >= 3:  # Correct response
            if repetitions == 0:
                interval = 1
            elif repetitions == 1:
                interval = 6
            else:
                interval = round(interval * ease_factor)

            repetitions += 1
        else:  # Incorrect response, reset repetitions but keep the word for immediate review
            repetitions = 0
            interval = 1

        # Update Ease Factor: EF = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
        ease_factor = ease_factor + (
            0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
        )

        # Min ease factor should be 1.3
        if ease_factor < 1.3:
            ease_factor = 1.3

        next_review_date = datetime.now(
            timezone.utc) + timedelta(days=interval)

        return {
            "next_review": next_review_date,
            "ease_factor": ease_factor,
            "interval": interval,
            "repetitions": repetitions,
        }


srs_engine = SRSEngine()
