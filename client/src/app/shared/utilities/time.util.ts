export class TimeUtil {
    public static oneDay = 24 * 60 * 60 * 1000;
    public static oneHour = 60 * 60 * 1000;

    public static getDiffDays(date1: Date, date2: Date): number {
      return Math.abs(Math.round((date1.getTime() - date2.getTime()) / (TimeUtil.oneDay)));
    }

    public static getDiffHours(date1: Date, date2: Date): number {
        return Math.abs(Math.round((date1.getTime() - date2.getTime()) / (TimeUtil.oneHour)));
    }

    public static async sleep(ms: Number): Promise<void> {
      await TimeUtil._sleep(ms);
    }
    private static _sleep(ms: Number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }
