export interface ApiSpec {
    tool_name: string;
    target_api: number | null;
    allowed_params: Set<string>;
}
