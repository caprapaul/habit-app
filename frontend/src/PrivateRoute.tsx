import { IonRouterLink } from "@ionic/react";
import { Redirect, Route, RouteProps } from "react-router";
import { getToken } from "./core/token-helper";

export type ProtectedRouteProps = {
    isAuthenticated: boolean;
    authenticationPath: string;
    routerAnimation?: any;
} & RouteProps;

const defaultProps: ProtectedRouteProps = {
    isAuthenticated: !!getToken(),
    authenticationPath: "/login",
};

const ProtectedRoute = ({
    isAuthenticated,
    authenticationPath,
    ...routeProps
}: ProtectedRouteProps) => {
    if (isAuthenticated) {
        return <Route routerAnimation {...routeProps} />;
    } else {
        return <Redirect to={{ pathname: authenticationPath }} />;
    }
};
ProtectedRoute.defaultProps = defaultProps;

export default ProtectedRoute;
